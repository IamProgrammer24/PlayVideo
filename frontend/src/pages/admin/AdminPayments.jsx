import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

// ─── Filter tabs ───
const TABS = ["All", "Pending", "Approved", "Rejected"];

// ─── Status Badge ───
const StatusBadge = ({ status }) => {
  const config = {
    approved: {
      icon: CheckCircle,
      label: "Approved",
      class: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    pending: {
      icon: Clock,
      label: "Pending",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      class: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const { icon: Icon, label, class: cls } = config[status] || config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
};

// ─── Skeleton Row ───
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-white/5 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// ─── Skeleton Card ───
const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-5 bg-white/5 rounded-full w-20" />
    </div>
    <div className="h-3 bg-white/5 rounded w-1/2" />
    <div className="h-3 bg-white/5 rounded w-2/3" />
    <div className="flex gap-2 pt-1">
      <div className="h-8 bg-white/5 rounded-xl flex-1" />
      <div className="h-8 bg-white/5 rounded-xl flex-1" />
    </div>
  </div>
);

// ─── Verify Modal ───
const VerifyModal = ({ payment, onClose, onVerified }) => {
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!status) {
      setError("Please select approve or reject.");
      return;
    }
    if (status === "rejected" && !remarks.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.patch(
        `/api/admin/payments/${payment._id}/verify`,
        { status, remarks },
      );
      if (data.success) {
        onVerified(payment._id, status, remarks);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Verify Payment</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Payment details */}
        <div className="px-5 py-4 space-y-2 border-b border-white/5 bg-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">User</span>
            <span className="text-white font-medium">
              {payment.userId?.username}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Plan</span>
            <span className="text-white font-medium">
              {payment.planId?.name} Plan
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">₹{payment.amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">UTR</span>
            <span className="text-white font-mono text-xs">{payment.utr}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Date</span>
            <span className="text-white">
              {format(new Date(payment.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Approve / Reject buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setStatus("approved");
                setError(null);
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${
                  status === "approved"
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
            >
              ✓ Approve
            </button>
            <button
              onClick={() => {
                setStatus("rejected");
                setError(null);
              }}
              className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${
                  status === "rejected"
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
            >
              ✗ Reject
            </button>
          </div>

          {/* Remarks — shown when rejecting */}
          {status === "rejected" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Reason for rejection
              </label>
              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  setError(null);
                }}
                rows={3}
                placeholder="Enter reason..."
                className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10
                           focus:border-red-500/50 text-sm text-white placeholder-gray-600
                           outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={13} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !status}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                       bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminPayments ───
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await axiosInstance.get("/api/admin/payments");
        if (data.success) {
          const sorted = data.payments.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setPayments(sorted);
        }
      } catch {
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // ─── Update payment status locally after verify ───
  const handleVerified = (paymentId, status, remarks) => {
    setPayments((prev) =>
      prev.map((p) => (p._id === paymentId ? { ...p, status, remarks } : p)),
    );
  };

  // ─── Filter ───
  const filtered =
    activeTab === "All"
      ? payments
      : payments.filter((p) => p.status === activeTab.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Payments</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage and verify payment requests
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-white/5 overflow-x-auto">
          {TABS.map((tab) => {
            const count =
              tab === "All"
                ? payments.length
                : payments.filter((p) => p.status === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                  ${
                    activeTab === tab
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab}
                {!loading && count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full
                    ${activeTab === tab ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10 text-gray-500"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "User",
                  "Plan",
                  "Amount",
                  "UTR",
                  "Status",
                  "Date",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        {payment.userId?.username}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-300">
                        {payment.planId?.name} Plan
                      </p>
                      <p className="text-xs text-gray-600">
                        {payment.planId?.plays} plays
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-white">
                        ₹{payment.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-300">
                        {payment.utr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge status={payment.status} />
                        {payment.remarks && (
                          <p className="text-xs text-gray-500 max-w-[150px] truncate">
                            {payment.remarks}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {format(new Date(payment.createdAt), "dd MMM yyyy")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(payment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {payment.status === "pending" ? (
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30
                                     text-xs font-semibold text-indigo-400 hover:bg-indigo-600/30
                                     transition-all"
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              No payments found
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {filtered.map((payment) => (
                <div
                  key={payment._id}
                  className="rounded-2xl bg-[#0B1220] border border-white/5 p-4 space-y-3"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {payment.userId?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {payment.planId?.name} Plan · {payment.planId?.plays}{" "}
                        plays
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>

                  <div className="border-t border-white/5" />

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Amount</span>
                      <span className="text-sm font-semibold text-white">
                        ₹{payment.amount}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-xs text-gray-500 shrink-0">
                        UTR
                      </span>
                      <span className="text-xs font-mono text-gray-300 truncate">
                        {payment.utr}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Date</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(payment.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Remarks */}
                  {payment.remarks && (
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400">{payment.remarks}</p>
                    </div>
                  )}

                  {/* Verify button */}
                  {payment.status === "pending" && (
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                                 text-white text-sm font-semibold transition-all"
                    >
                      Verify Payment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Verify Modal ── */}
      {selectedPayment && (
        <VerifyModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
};

export default AdminPayments;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { formatDistanceToNow, format } from "date-fns";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  ChevronRight,
} from "lucide-react";

// ─── Filter Tabs ───
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
    {[...Array(5)].map((_, i) => (
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
    <div className="h-3 bg-white/5 rounded w-1/4" />
  </div>
);

// ─── Empty State ───
const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
      <CreditCard size={24} className="text-gray-500" />
    </div>
    <p className="text-sm font-medium text-gray-400">
      {filtered ? "No payments found" : "No payment history yet"}
    </p>
    <p className="text-xs text-gray-600 mt-1">
      {filtered
        ? "Try selecting a different filter"
        : "Your payment requests will appear here"}
    </p>
  </div>
);

// ─── Main PaymentHistory ───
const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await axiosInstance.get("/api/payment/my-payments");
        if (data.success) setPayments(data.payments);
      } catch {
        setError("Failed to load payment history. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // ─── Filter payments by tab ───
  const filtered =
    activeTab === "All"
      ? payments
      : payments.filter((p) => p.status === activeTab.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Payment History
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Track all your payment requests
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150
                  ${
                    activeTab === tab
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab}
                {!loading && count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full
                      ${
                        activeTab === tab
                          ? "bg-indigo-500/30 text-indigo-300"
                          : "bg-white/10 text-gray-500"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Desktop Table (md and above) ── */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  UTR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState filtered={activeTab !== "All"} />
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
                        {payment.planId?.name} Plan
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {payment.planId?.plays} plays
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-white">
                        ₹{payment.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-300">
                        {payment.utr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {format(new Date(payment.createdAt), "dd MMM yyyy")}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatDistanceToNow(new Date(payment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (below md) ── */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-3 space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filtered={activeTab !== "All"} />
          ) : (
            <div className="p-3 space-y-3">
              {filtered.map((payment) => (
                <div
                  key={payment._id}
                  className="rounded-2xl bg-[#0B1220] border border-white/5 p-4 space-y-3"
                >
                  {/* Top row — plan + status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {payment.planId?.name} Plan
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {payment.planId?.plays} plays
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/5" />

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Amount</span>
                      <span className="text-sm font-semibold text-white">
                        ₹{payment.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-500 shrink-0">
                        UTR
                      </span>
                      <span className="text-xs font-mono text-gray-300 truncate">
                        {payment.utr}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Date</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(payment.createdAt), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Remarks if rejected */}
                  {payment.status === "rejected" && payment.remarks && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle
                        size={13}
                        className="text-red-400 mt-0.5 shrink-0"
                      />
                      <p className="text-xs text-red-300">{payment.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Buy Plan CTA ── */}
      {!loading && payments.length === 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
          <div>
            <p className="text-sm font-semibold text-white">
              Ready to get started?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Choose a plan and start generating play links
            </p>
          </div>
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shrink-0"
          >
            View Plans
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

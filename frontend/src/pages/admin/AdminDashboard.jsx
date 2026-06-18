import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  Users,
  CreditCard,
  MessageCircle,
  TrendingUp,
  Play,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// ─── Stat Card ───
const StatCard = ({ icon: Icon, label, value, sub, color, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-2xl bg-[#111827] border border-white/5 p-5
                hover:border-white/10 transition-all duration-200 group
                ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
      {onClick && (
        <ChevronRight
          size={15}
          className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1"
        />
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  </button>
);

// ─── Skeleton Stat Card ───
const SkeletonStatCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 animate-pulse space-y-4">
    <div className="w-10 h-10 rounded-xl bg-white/5" />
    <div className="space-y-2">
      <div className="h-8 bg-white/5 rounded w-1/3" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
    </div>
  </div>
);

// ─── Payment Status Badge ───
const PaymentBadge = ({ status }) => {
  const config = {
    approved: {
      icon: CheckCircle,
      class: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    pending: {
      icon: Clock,
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    rejected: {
      icon: XCircle,
      class: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const { icon: Icon, class: cls } = config[status] || config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      <Icon size={10} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Ticket Status Badge ───
const TicketBadge = ({ status }) => {
  const config = {
    open: { class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "in-progress": {
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    closed: { class: "bg-green-500/10 text-green-400 border-green-500/20" },
  };
  const cls = config[status]?.class || config.open.class;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Main AdminDashboard ───
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, paymentsRes, ticketsRes] = await Promise.all([
          axiosInstance.get("/api/admin/stats"),
          axiosInstance.get("/api/admin/payments"),
          axiosInstance.get("/api/admin/tickets"),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);

        if (paymentsRes.data.success) {
          // pending first then newest
          const sorted = paymentsRes.data.payments.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setRecentPayments(sorted.slice(0, 5));
        }

        if (ticketsRes.data.success) {
          // open/in-progress first then newest
          const sorted = ticketsRes.data.tickets.sort((a, b) => {
            const priority = { open: 0, "in-progress": 1, closed: 2 };
            if (priority[a.status] !== priority[b.status])
              return priority[a.status] - priority[b.status];
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setRecentTickets(sorted.slice(0, 5));
        }
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-400">Overview of your platform</p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          [...Array(7)].map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats?.totalUsers ?? 0}
              color="bg-indigo-600"
              onClick={() => navigate("/admin/users")}
            />
            <StatCard
              icon={CreditCard}
              label="Total Payments"
              value={stats?.totalPayments ?? 0}
              sub={`${stats?.pendingPayments ?? 0} pending`}
              color="bg-violet-600"
              onClick={() => navigate("/admin/payments")}
            />
            <StatCard
              icon={MessageCircle}
              label="Total Tickets"
              value={stats?.totalTickets ?? 0}
              sub={`${stats?.openTickets ?? 0} open`}
              color="bg-blue-600"
              onClick={() => navigate("/admin/tickets")}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`₹${stats?.totalRevenue ?? 0}`}
              sub="From approved payments"
              color="bg-green-600"
            />
            <StatCard
              icon={Play}
              label="Plays Today"
              value={stats?.playsToday ?? 0}
              sub="Generated today"
              color="bg-orange-600"
            />
          </>
        )}
      </div>

      {/* ── Recent Payments + Recent Tickets ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Payments */}
        <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">
              Recent Payments
            </h2>
            <button
              onClick={() => navigate("/admin/payments")}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 animate-pulse"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                  <div className="h-5 w-16 bg-white/5 rounded-full" />
                </div>
              ))
            ) : recentPayments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">No payments yet</p>
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  onClick={() => navigate("/admin/payments")}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {payment.userId?.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {payment.planId?.name} Plan · ₹{payment.amount} ·{" "}
                      {formatDistanceToNow(new Date(payment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <PaymentBadge status={payment.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Recent Tickets</h2>
            <button
              onClick={() => navigate("/admin/tickets")}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 animate-pulse"
                >
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                  <div className="h-5 w-20 bg-white/5 rounded-full" />
                </div>
              ))
            ) : recentTickets.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">No tickets yet</p>
              </div>
            ) : (
              recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ticket.userId?.username} ·{" "}
                      {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <TicketBadge status={ticket.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { formatDistanceToNow, format } from "date-fns";
import {
  MessageCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

// ─── Filter Tabs ───
const TABS = ["All", "Open", "In Progress", "Closed"];

// ─── Status Badge ───
const StatusBadge = ({ status }) => {
  const config = {
    open: {
      icon: Clock,
      label: "Open",
      class: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    "in-progress": {
      icon: AlertCircle,
      label: "In Progress",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    closed: {
      icon: CheckCircle,
      label: "Closed",
      class: "bg-green-500/10 text-green-400 border-green-500/20",
    },
  };
  const { icon: Icon, label, class: cls } = config[status] || config.open;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
};

// ─── Skeleton Card ───
const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 bg-white/5 rounded w-1/2" />
      <div className="h-5 bg-white/5 rounded-full w-20" />
    </div>
    <div className="h-3 bg-white/5 rounded w-1/3" />
    <div className="h-3 bg-white/5 rounded w-1/4" />
  </div>
);

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

const AdminTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await axiosInstance.get("/api/admin/tickets");
        if (data.success) {
          const sorted = data.tickets.sort((a, b) => {
            const priority = { open: 0, "in-progress": 1, closed: 2 };
            if (priority[a.status] !== priority[b.status])
              return priority[a.status] - priority[b.status];
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setTickets(sorted);
        }
      } catch {
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // ─── Filter ───
  const filtered =
    activeTab === "All"
      ? tickets
      : tickets.filter(
          (t) => t.status === activeTab.toLowerCase().replace(" ", "-"),
        );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Tickets</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage and respond to support tickets
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
                ? tickets.length
                : tickets.filter(
                    (t) => t.status === tab.toLowerCase().replace(" ", "-"),
                  ).length;
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
                    ${
                      activeTab === tab
                        ? "bg-yellow-500/20 text-yellow-300"
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

        {/* ── Desktop Table ── */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["User", "Subject", "Replies", "Status", "Date", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm text-gray-500"
                  >
                    No tickets found
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        {ticket.userId?.username}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-300">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">
                        {ticket.replies?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {format(new Date(ticket.createdAt), "dd MMM yyyy")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-600" />
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
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No tickets found</p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {filtered.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B1220] border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle size={16} className="text-indigo-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">
                        {ticket.subject}
                      </p>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ticket.userId?.username} · {ticket.replies?.length ?? 0}{" "}
                      replies ·{" "}
                      {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;

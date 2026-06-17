import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Loader2,
} from "lucide-react";

// ─── Constants ───
const SUBJECTS = [
  "Payment Issue",
  "Credits Issue",
  "Video Not Loading",
  "Account Issue",
  "Other",
];

// ─── Status config ───
const STATUS_CONFIG = {
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

// ─── Status Badge ───
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const { icon: Icon, label, class: cls } = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
};

// ─── Skeleton ───
const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-5 bg-white/5 rounded-full w-20" />
    </div>
    <div className="h-3 bg-white/5 rounded w-2/3" />
    <div className="h-3 bg-white/5 rounded w-1/4" />
  </div>
);

// ─── New Ticket Modal ───
const NewTicketModal = ({ onClose, onCreated }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!subject) {
      setError("Please select a subject.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.post("/api/support/create", {
        subject,
        message: message.trim(),
      });
      if (data.success) {
        onCreated(data.ticket);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket.");
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
        className="w-full max-w-lg bg-[#111827] rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">
            New Support Ticket
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-white/10
                         focus:border-indigo-500/50 text-sm text-white outline-none
                         transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Select a subject
              </option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-[#111827]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Describe your issue
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
              rows={4}
              placeholder="Describe your issue in detail... (min 10 characters)"
              className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10
                         focus:border-indigo-500/50 text-sm text-white placeholder-gray-600
                         outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-600 text-right">
              {message.length} chars
            </p>
          </div>

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
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-sm text-gray-300 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                       bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Support Page ───
const Support = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await axiosInstance.get("/api/support/my-tickets");
        if (data.success) setTickets(data.tickets);
      } catch {
        setError("Failed to load tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Support</h1>
          <p className="mt-1 text-sm text-gray-400">
            Raise a ticket and we'll get back to you
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600
                     hover:bg-indigo-500 text-white text-sm font-semibold
                     transition-all shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Ticket</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Tickets List ── */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-[#111827] border border-white/5 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-400">No tickets yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Create a ticket if you need help with anything
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl
                         bg-indigo-600 hover:bg-indigo-500 text-white text-sm
                         font-semibold transition-all"
            >
              <Plus size={14} />
              Create First Ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => navigate(`/support/${ticket._id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#111827] border
                         border-white/5 hover:border-white/10 cursor-pointer
                         transition-all duration-150 group"
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
                  {ticket.replies.length} replies ·{" "}
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={16}
                className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
              />
            </div>
          ))
        )}
      </div>

      {/* ── New Ticket Modal ── */}
      {showModal && (
        <NewTicketModal
          onClose={() => setShowModal(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default Support;

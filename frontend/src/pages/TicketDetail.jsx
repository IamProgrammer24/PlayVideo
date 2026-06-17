import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  MessageCircle,
  Shield,
  User,
} from "lucide-react";

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

const TicketDetail = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/support/${ticketId}`);
        if (data.success) setTicket(data.ticket);
      } catch {
        setError("Ticket not found or you don't have access.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  // Auto scroll to bottom when replies load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.replies]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;

    setSending(true);
    setReplyError(null);

    try {
      const { data } = await axiosInstance.post(
        `/api/support/${ticketId}/reply`,
        { message: reply.trim() },
      );
      if (data.success) {
        setTicket(data.ticket);
        setReply("");
      }
    } catch (err) {
      setReplyError(err.response?.data?.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  // ─── Loading ───
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-white/5 rounded-xl w-1/3 animate-pulse" />
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-3 animate-pulse">
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="h-3 bg-white/5 rounded w-1/4" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="h-16 bg-white/5 rounded-2xl w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-[#111827] border border-white/5 text-center px-4">
          <AlertCircle size={36} className="text-red-400 mb-3" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={() => navigate("/support")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            Back to Support
          </button>
        </div>
      </div>
    );
  }

  const isClosed = ticket?.status === "closed";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/support")}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              {ticket?.subject}
            </h1>
            <StatusBadge status={ticket?.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {format(new Date(ticket?.createdAt), "dd MMM yyyy, hh:mm a")}
          </p>
        </div>
      </div>

      {/* ── Original Message ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 flex items-center justify-center">
            <User size={12} className="text-indigo-400" />
          </div>
          <span className="text-xs font-medium text-indigo-400">
            {user?.username}
          </span>
          <span className="text-xs text-gray-600">· Original message</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {ticket?.message}
        </p>
      </div>

      {/* ── Replies ── */}
      {ticket?.replies.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-600 text-center">
            — {ticket.replies.length}{" "}
            {ticket.replies.length === 1 ? "reply" : "replies"} —
          </p>

          {ticket.replies.map((r, i) => {
            const isAdmin = r.sender === "admin";
            return (
              <div
                key={i}
                className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 space-y-1
                    ${
                      isAdmin
                        ? "bg-[#111827] border border-white/5 rounded-tl-sm"
                        : "bg-indigo-600/20 border border-indigo-500/20 rounded-tr-sm"
                    }`}
                >
                  {/* Sender label */}
                  <div className="flex items-center gap-1.5">
                    {isAdmin ? (
                      <Shield size={11} className="text-yellow-400" />
                    ) : (
                      <User size={11} className="text-indigo-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${isAdmin ? "text-yellow-400" : "text-indigo-400"}`}
                    >
                      {isAdmin ? "Support Team" : user?.username}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {r.message}
                  </p>

                  {/* Time */}
                  <p className="text-xs text-gray-600 text-right">
                    {format(new Date(r.createdAt), "dd MMM, hh:mm a")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Closed Notice ── */}
      {isClosed && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle size={15} className="text-green-400 shrink-0" />
          <p className="text-sm text-green-300">
            This ticket has been closed. Open a new ticket if you need further
            help.
          </p>
        </div>
      )}

      {/* ── Reply Input ── */}
      {!isClosed && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-3">
          <textarea
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setReplyError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            rows={3}
            placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
            className="w-full px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10
                       focus:border-indigo-500/50 text-sm text-white placeholder-gray-600
                       outline-none transition-all resize-none"
          />

          {replyError && (
            <div className="flex items-center gap-2">
              <AlertCircle size={13} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{replyError}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Press Enter to send</p>
            <button
              onClick={handleSendReply}
              disabled={sending || !reply.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600
                         hover:bg-indigo-500 text-white text-sm font-semibold
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;

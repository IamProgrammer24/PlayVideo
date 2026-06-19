import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import {
  Play,
  CreditCard,
  History,
  Zap,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Helper — shorten URL for display ───
const shortenUrl = (url, maxLen = 40) => {
  if (!url) return "Unknown";
  try {
    const { hostname, pathname } = new URL(url);
    const full = hostname + pathname;
    return full.length > maxLen ? full.slice(0, maxLen) + "..." : full;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen) + "..." : url;
  }
};

// ─── Quick Action Card ───
const QuickActionCard = ({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}) => (
  <button
    onClick={onClick}
    className="flex flex-col gap-3 p-4 rounded-2xl bg-[#111827] border border-white/5
               hover:border-indigo-500/30 hover:bg-[#1a2235] transition-all duration-200
               text-left w-full group"
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
        {label}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  </button>
);

// ─── Status Badge ───
const StatusBadge = ({ status }) =>
  status === "success" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
      <CheckCircle size={11} /> Success
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle size={11} /> Failed
    </span>
  );

// ─── Main Dashboard ───
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await axiosInstance.get("/api/play/history?limit=5");
        if (data.success) setActivities(data.activities);
      } catch (err) {
        console.error("Failed to fetch activities", err);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 space-y-6">
      {/* ── Welcome Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Hi, {user?.username} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* ── Remaining Plays Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-[100px]" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                ✨ Remaining Plays
              </span>

              <h2 className="mt-5 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent">
                {user?.credits ?? 0}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Ready to generate video links
              </p>
            </div>

            {/* Icon */}
            <div
              className="
          flex
         h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20
          items-center
          justify-center
          rounded-3xl
          border
          border-indigo-500/20
          bg-gradient-to-br
          from-indigo-500/20
          to-violet-500/10
          shadow-lg
          shadow-indigo-500/10
        "
            >
              <Play
                className="text-indigo-300 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
                fill="currentColor"
              />
            </div>
          </div>

          {/* Progress */}

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
              <span>Usage</span>
              <span>{user?.credits ?? 0} plays left</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((user?.credits ?? 0) / 100) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Divider */}

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Footer */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Ready to create your next link?
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Generate high-quality video links instantly.
              </p>
            </div>

            <button
              onClick={() => navigate("/generate")}
              className="
          group
          inline-flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-indigo-600
          to-violet-600
          px-6
          py-3
          text-sm
          font-semibold
          text-white
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-xl
          hover:shadow-indigo-500/30
          active:scale-95
        "
            >
              <Zap
                size={16}
                className="transition-transform duration-300 group-hover:rotate-12"
                fill="currentColor"
              />
              Generate Play
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickActionCard
            icon={Play}
            label="Generate Play"
            description="Create play link"
            color="bg-indigo-600"
            onClick={() => navigate("/generate")}
          />
          <QuickActionCard
            icon={CreditCard}
            label="View Plans"
            description="Choose a plan"
            color="bg-violet-600"
            onClick={() => navigate("/plans")}
          />
          <QuickActionCard
            icon={History}
            label="Payment History"
            description="View all payments"
            color="bg-blue-600"
            onClick={() => navigate("/payment-history")}
          />
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">
            Recent Activity
          </h2>
          <button
            onClick={() => navigate("/generate")}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all <ArrowRight size={13} />
          </button>
        </div>

        <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
          {loadingActivities ? (
            // skeleton
            <div className="divide-y divide-white/5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                  <div className="h-5 w-16 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Play size={20} className="text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-400">
                No activity yet
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Generate your first play link to see activity here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  onClick={() =>
                    activity.streamUrl && setSelectedVideo(activity)
                  }
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 transition-all duration-150
                    ${
                      activity.streamUrl
                        ? "hover:bg-white/5 cursor-pointer"
                        : "opacity-60 cursor-default"
                    }`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <LinkIcon size={14} className="text-indigo-400" />
                  </div>

                  {/* URL + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {shortenUrl(activity.url)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activity.fileType?.toUpperCase() || "Unknown"} ·{" "}
                      {activity.size || "Unknown"} ·{" "}
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <StatusBadge status={activity.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Video Player Modal ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#111827] rounded-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate pr-4">
                {selectedVideo.fileName || "Video"}
              </p>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <video
              src={selectedVideo.streamUrl}
              controls
              autoPlay
              className="w-full max-h-[60vh] bg-black"
            />

            {/* Download */}
            {selectedVideo.downloadUrl && (
              <div className="px-4 py-3 border-t border-white/5">
                <a
                  href={selectedVideo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                             bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                             transition-all duration-200"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

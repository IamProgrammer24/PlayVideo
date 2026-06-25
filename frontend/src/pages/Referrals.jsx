import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { format } from "date-fns";
import {
  Gift,
  Copy,
  Check,
  Users,
  AlertCircle,
  Share2,
  Sparkles,
} from "lucide-react";

// ─── Skeleton ───
const Skeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-3">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-10 bg-white/5 rounded-xl w-full" />
    </div>
    <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-3">
      <div className="h-4 bg-white/5 rounded w-1/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
    </div>
  </div>
);

const Referrals = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get("/api/user/referral-stats");
        if (data.success) setStats(data);
      } catch {
        setError("Failed to load referral data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const referralLink = stats
    ? `${window.location.origin}/register?ref=${stats.referralCode}`
    : "";

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — fail silently
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join PlayLink",
          text: "Use my referral link to get bonus credits on PlayLink!",
          url: referralLink,
        });
      } catch {
        // user cancelled share — ignore
      }
    } else {
      handleCopy(referralLink);
    }
  };

  const remainingReferrals = stats
    ? Math.max(0, stats.maxReferrals - stats.referralCount)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Referrals</h1>
        <p className="mt-1 text-sm text-gray-400">
          Invite friends and earn bonus credits
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {/* ── How it works banner ── */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/15 via-[#111827] to-[#111827] border border-indigo-500/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Gift size={15} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white">How it works</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-300">
                  You get{" "}
                  <span className="text-white font-semibold">10 credits</span>{" "}
                  for every friend who signs up
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-300">
                  Your friend gets{" "}
                  <span className="text-white font-semibold">5 credits</span>{" "}
                  instantly on signup
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400 shrink-0" />
                <p className="text-xs text-gray-300">
                  Max{" "}
                  <span className="text-white font-semibold">
                    {stats?.maxReferrals} referrals
                  </span>{" "}
                  per account
                </p>
              </div>
            </div>
          </div>

          {/* ── Referral Code + Link ── */}
          <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-4">
            <p className="text-sm font-semibold text-white">
              Your referral link
            </p>

            {/* Link box */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10">
              <span className="flex-1 text-sm text-gray-300 truncate font-mono">
                {referralLink}
              </span>
              <button
                onClick={() => handleCopy(referralLink)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-medium text-indigo-400 hover:bg-indigo-600/30 transition-all"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Code + Share */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-gray-500">Code:</span>
                <span className="text-sm font-mono font-semibold text-white tracking-wider">
                  {stats?.referralCode}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shrink-0"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>

            {remainingReferrals === 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle size={13} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-300">
                  You've reached the max referral limit. New signups via your
                  link won't earn bonus credits.
                </p>
              </div>
            )}
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Users size={16} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.referralCount ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                of {stats?.maxReferrals} referrals used
              </p>
            </div>
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-5">
              <div className="w-9 h-9 rounded-xl bg-green-600/20 border border-green-500/20 flex items-center justify-center mb-3">
                <Gift size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {(stats?.referralCount ?? 0) * 10}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">credits earned</p>
            </div>
          </div>

          {/* ── Referred Users List ── */}
          <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-sm font-semibold text-white">
                People you referred
              </p>
            </div>

            {stats?.referredUsers?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Users size={20} className="text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  No referrals yet
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Share your link to start earning bonus credits
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats?.referredUsers?.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {u.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {format(new Date(u.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-green-400">
                      +10 credits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Referrals;

import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Rocket, Users, Sparkles, Gift, Coins } from "lucide-react";

// ─── Calculate time remaining ───
const getTimeRemaining = (targetDate) => {
  const total = new Date(targetDate) - new Date();
  if (total <= 0) return null;

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { days, hours, minutes, seconds };
};

// ─── Time Box ───
const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <span className="text-lg sm:text-xl font-bold text-white">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="text-xs text-gray-500 mt-1">{label}</span>
  </div>
);

const LaunchBanner = () => {
  const [launchDate, setLaunchDate] = useState(null);
  const [interestedCount, setInterestedCount] = useState(0);
  const [targetInterested, setTargetInterested] = useState(100);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch launch status ───
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axiosInstance.get("/api/settings/launch-status");
        if (data.success) {
          setLaunchDate(data.launchDate);
          setInterestedCount(data.interestedCount);
          setTargetInterested(data.targetInterested);
        }
      } catch {
        // fail silently — non-critical banner
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // ─── Live countdown tick ───
  useEffect(() => {
    if (!launchDate) return;

    const tick = () => setTimeLeft(getTimeRemaining(launchDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  // ─── Don't show if no launch date set, or already loading, or already passed ───
  if (loading || !launchDate || !timeLeft) return null;

  const progressPercent = Math.min(
    100,
    Math.round((interestedCount / targetInterested) * 100),
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/15 via-[#111827] to-[#111827] border border-indigo-500/20 p-5 sm:p-6">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left — title + countdown */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Rocket size={15} className="text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-white">
              🚀 Launching Soon — Lock in launch pricing now!
            </p>
          </div>

          {/* Countdown boxes */}
          <div className="flex items-center gap-2 sm:gap-3">
            <TimeBox value={timeLeft.days} label="Days" />
            <span className="text-gray-600 text-lg mb-4">:</span>
            <TimeBox value={timeLeft.hours} label="Hours" />
            <span className="text-gray-600 text-lg mb-4">:</span>
            <TimeBox value={timeLeft.minutes} label="Min" />
            <span className="text-gray-600 text-lg mb-4">:</span>
            <TimeBox value={timeLeft.seconds} label="Sec" />
          </div>
        </div>
        {/* Benefits list */}
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2">
            Benefits of creating an account now
          </p>
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-indigo-400 shrink-0" />
            <p className="text-xs text-gray-300">
              Get <span className="text-white font-semibold">5 plays now</span>{" "}
              to test with demo data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Gift size={13} className="text-indigo-400 shrink-0" />
            <p className="text-xs text-gray-300">
              Get{" "}
              <span className="text-white font-semibold">10 free plays</span>{" "}
              once the site goes live
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Coins size={13} className="text-indigo-400 shrink-0" />
            <p className="text-xs text-gray-300">
              Buy any plan now and get{" "}
              <span className="text-white font-semibold">+50% bonus plays</span>
            </p>
          </div>
        </div>

        {/* Right — interested counter */}
        <div className="w-full sm:w-56 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-indigo-400" />
            <p className="text-sm text-gray-300">
              <span className="text-white font-semibold">
                {interestedCount}
              </span>
              {" / "}
              {targetInterested} interested
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1.5">
            {progressPercent}% of launch goal reached
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaunchBanner;

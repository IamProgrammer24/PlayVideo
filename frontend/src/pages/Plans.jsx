import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Zap, Flame, CheckCircle, AlertCircle } from "lucide-react";

// ─── Price per play calculator ───
const pricePerPlay = (price, plays) => {
  if (!plays) return "0";
  return (price / plays).toFixed(2);
};

// ─── Bonus plays calculator (1.5x display only) ───
const bonusPlays = (plays) => {
  return Math.floor(plays * 1.5);
};

const bonusPricePerPlay = (price, plays) => {
  const boosted = bonusPlays(plays);
  if (!boosted) return "0";
  return (price / boosted).toFixed(2);
};

// ─── Skeleton Card ───
const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-6 space-y-4 animate-pulse">
    <div className="h-4 bg-white/5 rounded w-1/3" />
    <div className="h-10 bg-white/5 rounded w-1/2" />
    <div className="h-3 bg-white/5 rounded w-2/3" />
    <div className="h-3 bg-white/5 rounded w-1/2" />
    <div className="h-10 bg-white/5 rounded-xl w-full mt-4" />
  </div>
);

// ─── Plan Card ───
const PlanCard = ({ plan, onChoose }) => {
  const perPlay = pricePerPlay(plan.price, plan.plays);

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200
        ${
          plan.isPopular
            ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10"
            : "bg-[#111827] border-white/5 hover:border-white/10"
        }`}
    >
      {/* Most Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-md">
            <Flame size={11} fill="currentColor" />
            Most Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <div>
        <h3 className="text-base font-semibold text-white">{plan.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl sm:text-4xl font-bold text-white">
            ₹{plan.price}
          </span>
          <span className="text-sm text-gray-500 mb-1">/month</span>
        </div>
      </div>

      {/* Plays + price per play */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CheckCircle size={14} className="text-indigo-400 shrink-0" />
          <span className="text-sm text-gray-300 flex items-center gap-1.5 flex-wrap">
            <span className="text-gray-500 line-through">{plan.plays}</span>
            <span className="text-white font-semibold">
              {bonusPlays(plan.plays)}
            </span>
            plays included
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
              🚀 LAUNCH OFFER +50%
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap
            size={14}
            className="text-indigo-400 shrink-0"
            fill="currentColor"
          />
          <span className="text-sm text-gray-300">
            <span className="text-white font-semibold">
              ₹{bonusPricePerPlay(plan.price, plan.plays)}
            </span>{" "}
            per play
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Choose Plan button */}
      <button
        onClick={() => onChoose(plan._id)}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]
          ${
            plan.isPopular
              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
          }`}
      >
        Choose Plan
      </button>
    </div>
  );
};

// ─── Main Plans Page ───
const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axiosInstance.get("/api/plans");
        if (data.success) setPlans(data.plans);
      } catch (err) {
        setError("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleChoose = (planId) => {
    navigate(`/payment/${planId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Available Plans
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Choose the perfect plan for your needs
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Plan Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} onChoose={handleChoose} />
            ))}
      </div>

      {/* ── Footer note ── */}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-center">
          <p className="text-xs text-gray-500">
            All plans are recurring. Cancel anytime.
          </p>
          <span className="hidden sm:block text-gray-700">·</span>
          <p className="text-xs text-gray-500">
            🔒 Secure payments. Your data is safe with us.
          </p>
        </div>
      )}
    </div>
  );
};

export default Plans;

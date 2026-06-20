import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import {
  Zap,
  QrCode,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import QR_PLACEHOLDER from "../assets/UPI_qr.jpeg";

// ─── Hardcoded UPI details (replace with real data later) ───
const UPI_ID = "kin9@ptyes";
// const QR_PLACEHOLDER = "../assets/UPI_qr.jpeg"; // replace with real QR image URL later

// ─── Payment app icons (emoji based for now) ───
const UPI_APPS = [
  {
    name: "GPay",
    icon: "https://images.seeklogo.com/logo-png/37/2/google-pay-tez-logo-png_seeklogo-370704.png",
  },
  {
    name: "PhonePe",
    icon: "https://e7.pngegg.com/pngimages/332/615/png-clipart-phonepe-india-unified-payments-interface-india-purple-violet.png",
  },
  {
    name: "Paytm",
    icon: "https://images.icon-icons.com/730/PNG/512/paytm_icon-icons.com_62778.png",
  },
  {
    name: "BHIM",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvrRrVCWRYQOR02CAcd6H2vwGzfSXB1XX2Qkw2ldVePtzGdtu19AivqL0&s=10",
  },
];

// ─── Skeleton ───
const PlanSkeleton = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 animate-pulse space-y-3">
    <div className="h-3 bg-white/5 rounded w-1/4" />
    <div className="flex justify-between">
      <div className="h-5 bg-white/5 rounded w-1/3" />
      <div className="h-5 bg-white/5 rounded w-1/4" />
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-white/5 rounded w-1/4" />
      <div className="h-4 bg-white/5 rounded w-1/4" />
    </div>
  </div>
);

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [planError, setPlanError] = useState(null);

  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ─── Fetch plan ───
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/plans/${planId}`);
        if (data.success) setPlan(data.plan);
      } catch {
        setPlanError("Plan not found. Please select a valid plan.");
      } finally {
        setLoadingPlan(false);
      }
    };
    fetchPlan();
  }, [planId]);

  // ─── UTR validation ───
  const validateUtr = (value) => {
    if (!value.trim()) return "UTR number is required.";
    if (!/^\d+$/.test(value)) return "UTR must contain numbers only.";
    if (value.length < 10 || value.length > 16)
      return "UTR must be between 10 and 16 digits.";
    return "";
  };

  const handleUtrChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // numbers only
    setUtr(value);
    if (utrError) setUtrError("");
    if (submitError) setSubmitError(null);
  };

  // ─── Submit payment ───
  const handleSubmit = async () => {
    const error = validateUtr(utr);
    if (error) {
      setUtrError(error);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = await axiosInstance.post("/api/payment/submit", {
        planId,
        utr,
      });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/payment-history"), 2500);
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Plan error state ───
  if (!loadingPlan && planError) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Complete Your Payment
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Scan the QR code and enter UTR details
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 py-12 rounded-2xl bg-[#111827] border border-white/5">
          <AlertCircle size={36} className="text-red-400" />
          <p className="text-sm text-red-300">{planError}</p>
          <button
            onClick={() => navigate("/plans")}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  // ─── Success state ───
  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-4 py-16 rounded-2xl bg-[#111827] border border-green-500/20 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Payment Submitted!</h2>
            <p className="text-sm text-gray-400 mt-1">
              Your payment request has been submitted successfully. Redirecting
              to payment history...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Complete Your Payment
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Scan the QR code and enter UTR details
        </p>
      </div>

      {/* ── Selected Plan ── */}
      {loadingPlan ? (
        <PlanSkeleton />
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Selected Plan
          </p>
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">
              {plan?.name} Plan
            </p>
            <button
              onClick={() => navigate("/plans")}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <RefreshCw size={12} />
              Change Plan
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">
              ₹{plan?.price}
            </span>
            <span className="text-sm text-gray-400">
              <span className="text-white font-semibold">{plan?.plays}</span>{" "}
              Plays
            </span>
          </div>
        </div>
      )}

      {/* ── Scan & Pay ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-4">
        <p className="text-sm font-semibold text-white">Scan & Pay</p>

        {/* Two boxes side by side */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left box — QR Code */}
          <div className="flex">
            <div className="w-36 h-36 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              {QR_PLACEHOLDER ? (
                <img
                  src={QR_PLACEHOLDER}
                  alt="QR Code"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <QrCode size={56} className="text-gray-800" />
                  <p className="text-xs text-gray-500 text-center px-2">
                    QR Code coming soon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right box — UPI details */}
          <div className="flex-1 flex flex-col">
            {/* UPI ID */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                UPI ID
              </p>
              <div className="flex items-center gap-2">
                <Zap
                  size={13}
                  className="text-indigo-400 shrink-0"
                  fill="currentColor"
                />
                <span className="text-sm font-semibold text-white break-all">
                  {UPI_ID}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* UPI App icons */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Pay using
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {UPI_APPS.map((app) => (
                  <div
                    key={app.name}
                    title={app.name}
                    className="flex flex-col items-center gap-1"
                  >
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {/* <span className="text-xs text-gray-600">{app.name}</span> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── UTR Input ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-3">
        <label className="block text-sm font-semibold text-white">
          Enter UTR Number
        </label>

        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B1220] border transition-all
            ${
              utrError
                ? "border-red-500/50"
                : "border-white/10 focus-within:border-indigo-500/50"
            }`}
        >
          <span className="text-gray-500 text-xs font-mono shrink-0">#</span>
          <input
            type="text"
            inputMode="numeric"
            value={utr}
            onChange={handleUtrChange}
            maxLength={16}
            placeholder="Enter 10-16 digit UTR number"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none font-mono"
          />
          <span className="text-xs text-gray-600 shrink-0">
            {utr.length}/16
          </span>
        </div>

        {utrError && (
          <div className="flex items-center gap-2">
            <AlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-400">{utrError}</p>
          </div>
        )}
      </div>

      {/* ── Submit Error ── */}
      {submitError && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{submitError}</p>
        </div>
      )}

      {/* ── Submit Button ── */}
      <button
        onClick={handleSubmit}
        disabled={submitting || loadingPlan}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                   transition-all duration-200 active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Payment"
        )}
      </button>

      {/* ── Footer note ── */}
      <p className="text-center text-xs text-gray-600 pb-4">
        🔒 After submission, your payment will be verified by Team.
      </p>
    </div>
  );
};

export default Payment;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import {
  Link as LinkIcon,
  Zap,
  X,
  ClipboardPaste,
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Film,
} from "lucide-react";

// ─── Default Thumbnail ───
const DEFAULT_THUMBNAIL = (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B1220] gap-2">
    <Film size={40} className="text-indigo-400/50" />
    <p className="text-xs text-gray-600">No preview available</p>
  </div>
);

const GeneratePlay = () => {
  const { user, updateCredits } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [noCredits, setNoCredits] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // ─── Paste from clipboard ───
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError(null);
    } catch {
      setError("Clipboard access denied. Please paste manually.");
    }
  };

  // ─── Clear input ───
  const handleClear = () => {
    setUrl("");
    setResult(null);
    setError(null);
    setNoCredits(false);
  };

  // ─── Generate ───
  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Please enter a URL first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setNoCredits(false);

    try {
      const { data } = await axiosInstance.post("/api/play/generate", { url });

      if (data.success) {
        setResult(data.play);
        updateCredits(data.remainingCredits);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";

      if (msg.toLowerCase().includes("credit")) {
        setNoCredits(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Generate Play
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Paste any supported URL and get your download links
        </p>
      </div>

      {/* ── Credits indicator ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] border border-white/5 w-fit">
        <Zap size={14} className="text-indigo-400" fill="currentColor" />
        <span className="text-sm text-gray-400">
          Remaining plays:{" "}
          <span className="text-white font-semibold">{user?.credits ?? 0}</span>
        </span>
      </div>

      {/* ── URL Input Card ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-5 space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Paste your URL here
        </label>

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 focus-within:border-indigo-500/50 transition-all">
          <LinkIcon size={16} className="text-gray-500 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="https://example.com/video/..."
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-0 disabled:opacity-50"
          />

          {/* Clear button */}
          {url && (
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-white transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Paste */}
          <button
            onClick={handlePaste}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       bg-white/5 border border-white/10 text-sm text-gray-300
                       hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <ClipboardPaste size={15} />
            Paste URL
          </button>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={loading || !url.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                       bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                       transition-all duration-200 active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap size={15} fill="currentColor" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Supported platforms */}
        <p className="text-xs text-gray-600">
          Supports: YouTube, Instagram, Facebook, Twitter, TikTok and more
        </p>
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── No Credits Message ── */}
      {noCredits && (
        <div className="rounded-2xl bg-[#111827] border border-yellow-500/20 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="text-yellow-400 mt-0.5 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-yellow-300">
                Not enough credits
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                You've used all your plays. Upgrade your plan to continue
                generating links.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/plans")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                       bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/20
                       text-yellow-300 text-sm font-semibold transition-all"
          >
            <CreditCard size={15} />
            View Plans
          </button>
        </div>
      )}

      {/* ── Result Card ── */}
      {result && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
          {/* Result header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <CheckCircle size={15} className="text-green-400" />
            <span className="text-sm font-semibold text-green-400">
              Generated Successfully
            </span>
          </div>

          {/* Video info */}
          <div className="flex flex-col sm:flex-row gap-4 p-5">
            {/* Thumbnail */}
            <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-[#0B1220] border border-white/5 shrink-0">
              {DEFAULT_THUMBNAIL}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm font-semibold text-white truncate">
                {result.file_name || "Video"}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs text-gray-400 uppercase">
                  {result.file_type || "Unknown"}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs text-gray-400">
                  {result.size || "Unknown size"}
                </span>
              </div>
              <p className="text-xs text-yellow-500/80">
                ⚠️ Links will expire in 24 hours
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 px-5 pb-5">
            {/* Play */}
            {result.stream_url && (
              <button
                onClick={() => setShowPlayer(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                           transition-all duration-200 active:scale-[0.98]"
              >
                <Play size={15} fill="currentColor" />
                Play Video
              </button>
            )}

            {/* Download */}
            {result.download_url && (
              <a
                href={result.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-white/5 border border-white/10 hover:bg-white/10
                           text-white text-sm font-semibold transition-all duration-200"
              >
                <Download size={15} />
                Download
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Video Player Modal ── */}
      {showPlayer && result?.stream_url && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPlayer(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#111827] rounded-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white truncate pr-4">
                {result.file_name || "Video"}
              </p>
              <button
                onClick={() => setShowPlayer(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Video */}
            <video
              src={result.stream_url}
              controls
              autoPlay
              className="w-full max-h-[60vh] bg-black"
            />

            {/* Download inside modal */}
            {result.download_url && (
              <div className="px-4 py-3 border-t border-white/5">
                <a
                  href={result.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                             bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                             transition-all duration-200"
                >
                  <Download size={15} />
                  Download Video
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePlay;

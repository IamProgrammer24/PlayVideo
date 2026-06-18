import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { format, formatDistanceToNow } from "date-fns";
import {
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Key,
  Search,
} from "lucide-react";

// ─── Skeleton Row ───
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-white/5 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// ─── Skeleton Card ───
const SkeletonCard = () => (
  <div className="rounded-2xl bg-[#111827] border border-white/5 p-4 space-y-3 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-5 bg-white/5 rounded-full w-16" />
    </div>
    <div className="h-3 bg-white/5 rounded w-1/2" />
    <div className="h-3 bg-white/5 rounded w-2/3" />
    <div className="h-8 bg-white/5 rounded-xl w-full mt-2" />
  </div>
);

// ─── Reset Password Modal ───
const ResetPasswordModal = ({ user, onClose, onReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axiosInstance.patch(
        `/api/admin/users/${user._id}/reset-password`,
        { newPassword },
      );
      if (data.success) {
        setSuccess(true);
        onReset(user._id);
        setTimeout(onClose, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
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
        className="w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Reset Password</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-3 bg-white/5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {user.username}
              </p>
              <p className="text-xs text-gray-500">
                {user.credits} credits · {user.plan || "No plan"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <p className="text-sm font-semibold text-green-400">
                Password reset successfully!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  placeholder="Enter new password (min 4 characters)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B1220] border border-white/10
                             focus:border-indigo-500/50 text-sm text-white placeholder-gray-600
                             outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={13} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-2 px-5 pb-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Key size={14} /> Reset
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main AdminUsers ───
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosInstance.get("/api/admin/users");
        if (data.success) setUsers(data.users);
      } catch {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ─── Search filter ───
  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage all registered users
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] border border-white/10 focus-within:border-indigo-500/50 transition-all w-full sm:w-64">
          <Search size={15} className="text-gray-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Stats row ── */}
      {!loading && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] border border-white/5 w-fit">
          <Users size={14} className="text-indigo-400" />
          <span className="text-sm text-gray-400">
            Total users:{" "}
            <span className="text-white font-semibold">{users.length}</span>
          </span>
          {search && (
            <span className="text-sm text-gray-600">
              · showing <span className="text-white">{filtered.length}</span>
            </span>
          )}
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 overflow-hidden">
        {/* ── Desktop Table ── */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "User",
                  "Credits",
                  "Plan",
                  "Joined",
                  "Last Active",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={28} className="text-gray-600" />
                      <p className="text-sm text-gray-500">
                        {search ? "No users found" : "No users yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-white">
                          {user.username}
                        </p>
                      </div>
                    </td>

                    {/* Credits */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-white">
                        {user.credits}
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm ${user.plan && user.plan !== "none" ? "text-indigo-400 font-medium" : "text-gray-600"}`}
                      >
                        {user.plan && user.plan !== "none"
                          ? user.plan
                          : "No plan"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {format(new Date(user.createdAt), "dd MMM yyyy")}
                      </p>
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(user.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   bg-indigo-600/10 border border-indigo-500/20
                                   text-xs font-medium text-indigo-400
                                   hover:bg-indigo-600/20 transition-all"
                      >
                        <Key size={12} />
                        Reset Password
                      </button>
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
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Users size={28} className="text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">
                {search ? "No users found" : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {filtered.map((user) => (
                <div
                  key={user._id}
                  className="rounded-2xl bg-[#0B1220] border border-white/5 p-4 space-y-3"
                >
                  {/* Top */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {format(new Date(user.createdAt), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5" />

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Credits</span>
                      <span className="text-sm font-semibold text-white">
                        {user.credits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Plan</span>
                      <span
                        className={`text-sm ${user.plan && user.plan !== "none" ? "text-indigo-400 font-medium" : "text-gray-600"}`}
                      >
                        {user.plan && user.plan !== "none"
                          ? user.plan
                          : "No plan"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Last active</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(user.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Reset Password */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               bg-indigo-600/10 border border-indigo-500/20 text-indigo-400
                               text-sm font-medium hover:bg-indigo-600/20 transition-all"
                  >
                    <Key size={14} />
                    Reset Password
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Reset Password Modal ── */}
      {selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onReset={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;

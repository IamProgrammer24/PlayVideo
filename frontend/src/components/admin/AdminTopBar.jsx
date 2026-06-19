import { Menu, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../dashboard/NotificationBell";

const AdminTopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const initial = user?.username?.charAt(0).toUpperCase() || "A";

  return (
    <header className="fixed top-0 right-0 z-20 left-0 lg:left-60 h-16 bg-[#0B1220]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu size={18} />
        </button>
        <span className="lg:hidden text-white font-bold text-base tracking-tight">
          Admin Panel
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Admin badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Shield size={13} className="text-yellow-400" />
          <span className="text-xs font-medium text-yellow-400">Admin</span>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Avatar */}
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-bold cursor-pointer select-none">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;

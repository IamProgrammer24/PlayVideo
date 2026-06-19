import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const initial = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <header
      className="
        fixed top-0 left-0 md:left-60 right-0 h-16
        bg-[#0B1220]/80 backdrop-blur-md
        border-b border-white/5
        flex items-center justify-between md:justify-end
        px-4 md:px-6 gap-3
        z-20
      "
    >
      {/* 📱 Mobile menu button */}
      <button className="md:hidden" onClick={onMenuClick}>
        ☰
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* 🔔 Bell */}
        <NotificationBell />

        {/* 👤 Avatar */}
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

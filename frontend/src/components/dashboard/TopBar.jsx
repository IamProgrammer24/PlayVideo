import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Menu size={18} />
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* 🔔 Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* 👤 Avatar */}
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

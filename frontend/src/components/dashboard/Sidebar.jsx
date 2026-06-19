import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Play,
  CreditCard,
  History,
  Settings,
  MessageCircle,
  LogOut,
  Zap,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Generate Play", icon: Play, to: "/generate" },
  { label: "Plans", icon: CreditCard, to: "/plans" },
  { label: "Payment History", icon: History, to: "/payment-history" },
  { label: "Support", icon: MessageCircle, to: "/support" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* 🌑 Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 z-50
    h-screen w-60
    bg-[#0F172A]
     flex flex-col
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-white font-bold text-lg">PlayLink</span>
          </div>

          {/* ❌ Close button (mobile only) */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose} // 📱 auto-close on mobile navigation
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group 
                ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-indigo-400"
                        : "text-gray-400 group-hover:text-white"
                    }
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

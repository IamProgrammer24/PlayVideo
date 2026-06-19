import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  CreditCard,
  MessageCircle,
  Users,
  LogOut,
  Shield,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Payments", icon: CreditCard, to: "/admin/payments" },
  { label: "Tickets", icon: MessageCircle, to: "/admin/tickets" },
  { label: "Users", icon: Users, to: "/admin/users" },
];

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 lg:w-60
        bg-[#111827] border-r border-white/5
        flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 shrink-0">
            <Shield size={16} className="text-yellow-400" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight block">
              PlayLink
            </span>
            <span className="text-yellow-400 text-xs font-medium">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Close — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150 group
               ${
                 isActive
                   ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
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
                      ? "text-yellow-400 shrink-0"
                      : "text-gray-400 group-hover:text-white shrink-0"
                  }
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

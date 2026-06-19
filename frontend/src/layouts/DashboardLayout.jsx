import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import TopBar from "../components/dashboard/TopBar";
import AppBackground from "../components/background/AppBackground";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0B1220] text-white">
      {/* Background */}
      <AppBackground />

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* TOPBAR */}
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      {/* MAIN CONTENT */}
      <main className="relative pt-16 md:ml-60 min-h-screen">
        <div className="p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

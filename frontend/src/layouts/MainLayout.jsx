import AppBackground from "../components/background/AppBackground";

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1220] text-white">
      <AppBackground />

      <main className="relative z-10">{children}</main>
    </div>
  );
};

export default MainLayout;

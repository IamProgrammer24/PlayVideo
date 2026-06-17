// frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import GeneratePlay from "../pages/GeneratePlay";
import Plans from "../pages/Plans";
import Payment from "../pages/Payment";
import PaymentHistory from "../pages/PaymentHistory";
import Support from "../pages/Support";
import TicketDetail from "../pages/TicketDetail";
import NotFound from "../pages/NotFound";

const ProtectedRoute = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  return user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all share DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<GeneratePlay />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/payment/:planId" element={<Payment />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support/:ticketId" element={<TicketDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

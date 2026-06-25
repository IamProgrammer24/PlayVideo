// frontend/src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPayments from "../pages/admin/AdminPayments";
import AdminTickets from "../pages/admin/AdminTickets";
import AdminTicketDetail from "../pages/admin/AdminTicketDetail";
import AdminUsers from "../pages/admin/AdminUsers";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import GeneratePlay from "../pages/GeneratePlay";
import Plans from "../pages/Plans";
import Payment from "../pages/Payment";
import PaymentHistory from "../pages/PaymentHistory";
import Support from "../pages/Support";
import TicketDetail from "../pages/TicketDetail";
import Referrals from "../pages/Referrals";
import NotFound from "../pages/NotFound";

const ProtectedRoute = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
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
          <Route path="/referrals" element={<Referrals />} />
        </Route>

        <Route path="*" element={<NotFound />} />
        {/* Admin routes */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route
            path="/admin/tickets/:ticketId"
            element={<AdminTicketDetail />}
          />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

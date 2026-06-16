import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/Dashboard";
import GeneratePlay from "../pages/GeneratePlay";
import Plans from "../pages/Plans";
import Payment from "../pages/Payment";
import PaymentHistory from "../pages/PaymentHistory";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate" element={<GeneratePlay />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/payment/:planId" element={<Payment />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;

// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // ─── Check if user is already logged in on app load ───
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthChecked(true);
  }, []);

  // ─── REGISTER ───
  const register = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/user/register", {
        username,
        password,
      });

      toast.success(data.message || "Account created!");
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGIN ───
  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/user/login", {
        username,
        password,
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Welcome back!");
      return { success: true, isAdmin: data.user.isAdmin };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGOUT ───
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out!");
  };

  // ─── UPDATE CREDITS (after generate/payment) ───
  const updateCredits = (newCredits) => {
    const updatedUser = { ...user, credits: newCredits };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        register,
        login,
        logout,
        updateCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom hook ───
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export default AuthContext;

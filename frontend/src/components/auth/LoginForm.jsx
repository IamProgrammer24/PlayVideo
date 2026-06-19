// frontend/src/components/auth/LoginForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";

const LoginForm = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData.username, formData.password);
    if (result.success) {
      result.isAdmin ? navigate("/admin") : navigate("/dashboard");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Welcome Back 👋</h2>
        <p className="mt-2 text-sm text-gray-400">
          Sign in to continue to your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Username
          </label>
          <Input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>
          <Input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Register
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500 mt-4">
        Need help?
        <a
          href="https://t.me/Chhekur"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Chat with us on Telegram
        </a>
      </p>
    </div>
  );
};

export default LoginForm;

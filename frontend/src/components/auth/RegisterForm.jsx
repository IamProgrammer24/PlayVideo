// frontend/src/components/auth/RegisterForm.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";

const RegisterForm = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.trim().length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register(formData.username, formData.password);
    if (result.success) navigate("/"); // redirect to login after register
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Create Account 🚀</h2>
        <p className="mt-2 text-sm text-gray-400">
          Sign up to continue to your account
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3">
        <span className="mt-0.5 text-lg">🔒</span>
        <p className="text-xs text-indigo-300 leading-relaxed">
          <span className="font-semibold text-indigo-200">
            No private info needed.
          </span>{" "}
          We don't collect any personal data. Just pick any username and
          password to get started!
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
            placeholder="Enter any username"
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
            placeholder="Enter any password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/"
          className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;

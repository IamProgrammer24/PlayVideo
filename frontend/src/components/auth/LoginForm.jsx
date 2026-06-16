import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Logo from "../ui/Logo";

const LoginForm = () => {
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
      <form className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Username
          </label>

          <Input type="text" placeholder="Enter your username" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>

          <Input type="password" placeholder="Enter your password" />
        </div>

        <Button type="submit">Login</Button>
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
    </div>
  );
};

export default LoginForm;

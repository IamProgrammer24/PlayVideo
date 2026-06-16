import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Logo from "../ui/Logo";

const RegisterForm = () => {
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
      <form className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Username
          </label>
          <Input type="text" placeholder="Enter any username" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Password
          </label>
          <Input type="password" placeholder="Enter any password" />
        </div>

        <Button type="submit">Sign Up</Button>
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

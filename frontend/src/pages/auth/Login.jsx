import LoginForm from "../../components/auth/LoginForm";
import AuthLayout from "../../layouts/AuthLayout";

const Login = () => {
  return (
    <AuthLayout maxWidth="max-w-lg">
      {/* Login Card goes here */}
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;

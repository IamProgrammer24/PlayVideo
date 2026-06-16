import RegisterForm from "../../components/auth/RegisterForm";
import AuthLayout from "../../layouts/AuthLayout";

const Register = () => {
  return (
    <AuthLayout maxWidth="max-w-lg">
      {/* Register Card goes here */}
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;

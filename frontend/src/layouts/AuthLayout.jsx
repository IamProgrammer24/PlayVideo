import MainLayout from "./MainLayout";

const AuthLayout = ({ children, maxWidth = "max-w-md" }) => {
  return (
    <MainLayout>
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className={`w-full ${maxWidth}`}>{children}</div>
      </div>
    </MainLayout>
  );
};

export default AuthLayout;

import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const NotFound = () => {
  return (
    <MainLayout>
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* Background 404 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <h1 className="text-[10rem] font-black text-white/[0.03] sm:text-[14rem] md:text-[18rem] lg:text-[24rem] tracking-tight">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/10 p-5 backdrop-blur-xl">
            <span className="text-5xl">🚀</span>
          </div>

          <h2 className="text-4xl font-bold text-white">Page Not Found</h2>

          <p className="mt-4 text-gray-400 leading-7">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to a working page.
          </p>

          <Link
            to="/dashboard"
            className="
              mt-10
              rounded-xl
              bg-indigo-600
              px-6
              py-3
              font-medium
              text-white
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-indigo-500
              hover:shadow-lg
              hover:shadow-indigo-500/30
            "
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;

const Button = ({ children, type = "button", className = "", ...props }) => {
  return (
    <button
      type={type}
      className={`
        w-full
        rounded-xl
        bg-indigo-600
        px-4
        py-3
        font-medium
        text-white
        transition-all
        duration-200
        hover:bg-indigo-500
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

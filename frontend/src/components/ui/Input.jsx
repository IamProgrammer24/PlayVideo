const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-white/10
        bg-white/5
        px-4
        py-3
        text-white
        placeholder:text-gray-400
        outline-none
        backdrop-blur-md
        transition-all
        focus:border-indigo-500
        focus:ring-2
        focus:ring-indigo-500/20
        ${className}
      `}
      {...props}
    />
  );
};

export default Input;

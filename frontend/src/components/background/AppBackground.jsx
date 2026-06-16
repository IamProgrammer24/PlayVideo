const stars = Array.from({ length: 50 });

const AppBackground = () => {
  return (
    <>
      {/* Left Glow */}
      <div className="absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[150px]" />

      {/* Right Glow */}
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[150px]" />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((_, index) => (
          <span
            key={index}
            className="absolute h-1 w-1 rounded-full bg-white animate-pulse"
            style={{
              opacity: Math.random() * 0.5 + 0.1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Bottom Grid */}
      <div
        className="
          absolute
          bottom-0
          left-0
          h-80
          w-full
          opacity-10
          [background-size:40px_40px]
          [background-image:
          linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),
          linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)]
          [mask-image:linear-gradient(to_top,white,transparent)]
        "
      />
    </>
  );
};

export default AppBackground;

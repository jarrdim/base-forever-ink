export const AnimatedBackground = () => {
  return (
    <>
      {/* Floating Particles */}
      <div className="floating-particles">
        {[...Array(15)].map((_, i) => (
          <div key={`particle-${i}`} className="particle" />
        ))}
      </div>

      {/* Animated Orbs */}
      <div className="animated-orbs">
        {[...Array(5)].map((_, i) => (
          <div key={`orb-${i}`} className="orb" />
        ))}
      </div>

      {/* Floating Dots */}
      <div className="floating-dots">
        {[...Array(20)].map((_, i) => (
          <div key={`dot-${i}`} className="dot" />
        ))}
      </div>

      {/* Animated Lines */}
      <div className="animated-lines">
        {[...Array(8)].map((_, i) => (
          <div key={`line-${i}`} className="line" />
        ))}
      </div>
    </>
  );
};

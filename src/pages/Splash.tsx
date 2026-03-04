import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(() => navigate("/home"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-brand transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-foreground/5 animate-[scale-in_1.5s_ease-out]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5 animate-[scale-in_1.8s_ease-out]" />
        <div className="absolute top-1/4 right-10 w-20 h-20 rounded-full bg-primary-foreground/5 animate-[fade-in_2s_ease-out]" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center animate-scale-in">
        <div className="text-7xl font-extrabold tracking-tight text-primary-foreground mb-1">
          <span className="text-primary-foreground/80">J</span>Smart
        </div>
        <div
          className="text-sm font-semibold tracking-[0.25em] uppercase text-primary-foreground/70 animate-fade-in"
          style={{ animationDelay: "0.6s", animationFillMode: "both" }}
        >
          Click | Select | Deliver
        </div>
      </div>

      {/* Bottom wave dots */}
      <div className="absolute bottom-16 flex gap-2 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "both" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-primary-foreground" : "bg-primary-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Splash;

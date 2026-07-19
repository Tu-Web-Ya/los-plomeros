import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Drip {
  id: number;
  left: number; // horizontal offset in %
  size: number; // width/height in px
  delay: number; // formation time in seconds
}

export function CeilingDrips() {
  const [drips, setDrips] = useState<Drip[]>([]);

  useEffect(() => {
    let active = true;
    let nextId = 0;

    const spawnDrip = () => {
      if (!active) return;

      const newDrip: Drip = {
        id: nextId++,
        left: 5 + Math.random() * 90, // random position between 5% and 95%
        size: 8 + Math.random() * 7,   // sizes between 8px and 15px
        delay: 1.2 + Math.random() * 1.5, // forming time: 1.2s to 2.7s
      };

      setDrips((prev) => [...prev, newDrip]);

      // Spawn next drip after a shorter random interval (1.5s to 4.5s)
      // to increase the dripping frequency slightly
      const nextSpawnTime = 1500 + Math.random() * 3000;
      setTimeout(spawnDrip, nextSpawnTime);
    };

    // Initial delay before first drip starts forming (3 seconds)
    const initialTimeout = setTimeout(spawnDrip, 3000);

    return () => {
      active = false;
      clearTimeout(initialTimeout);
    };
  }, []);

  const removeDrip = (id: number) => {
    setDrips((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {drips.map((drip) => (
        <DripItem key={drip.id} drip={drip} onComplete={() => removeDrip(drip.id)} />
      ))}
    </div>
  );
}

function DripItem({ drip, onComplete }: { drip: Drip; onComplete: () => void }) {
  const [phase, setPhase] = useState<"forming" | "falling" | "splash">("forming");

  useEffect(() => {
    const formingTimeout = setTimeout(() => {
      setPhase("falling");
    }, drip.delay * 1000);

    return () => clearTimeout(formingTimeout);
  }, [drip.delay]);

  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const handleAnimationComplete = () => {
    if (phase === "falling") {
      setPhase("splash");
      setTimeout(onComplete, 300); // splash animation duration
    }
  };

  return (
    <div
      className="absolute top-0"
      style={{
        left: `${drip.left}%`,
        width: drip.size,
        height: drip.size * 1.5,
      }}
    >
      {phase !== "splash" ? (
        <motion.svg
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_2px_5px_rgba(14,165,233,0.35)]"
          initial={{ scale: 0, y: -5, opacity: 0 }}
          animate={
            phase === "forming"
              ? {
                  scale: [0, 0.4, 0.8, 1, 1.05, 1],
                  y: [0, 1.5, 3, 4.5, 6, 7],
                  opacity: [0, 0.5, 0.8, 0.95],
                }
              : {
                  y: viewportHeight + 20,
                  scaleY: 1.5, // Estirado vertical en caída
                  scaleX: 0.8,
                  opacity: 0.9,
                }
          }
          transition={
            phase === "forming"
              ? { duration: drip.delay, ease: "easeOut" }
              : { duration: 0.8, ease: [0.6, 0.05, 0.9, 0.35] }
          }
          onAnimationComplete={handleAnimationComplete}
        >
          <defs>
            {/* Degradado para el cuerpo líquido de la gota */}
            <linearGradient id="dropGrad" x1="6" y1="0" x2="6" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
            </linearGradient>
            
            {/* Contorno brillante para refracción del cristal */}
            <linearGradient id="borderGrad" x1="0" y1="0" x2="12" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Cuerpo de la Gota */}
          <path
            d="M6 0C6 0 0 7.2 0 11.4C0 15.045 2.6865 18 6 18C9.3135 18 12 15.045 12 11.4C12 7.2 6 0 6 0Z"
            fill="url(#dropGrad)"
            stroke="url(#borderGrad)"
            strokeWidth="0.45"
          />

          {/* Brillo especular superior izquierdo (Reflejo del entorno) */}
          <ellipse 
            cx="3.8" 
            cy="9.5" 
            rx="0.9" 
            ry="1.8" 
            fill="#ffffff" 
            fillOpacity="0.85" 
            transform="rotate(-22 3.8 9.5)" 
          />

          {/* Brillo secundario menor */}
          <circle 
            cx="5.2" 
            cy="7.8" 
            r="0.4" 
            fill="#ffffff" 
            fillOpacity="0.65" 
          />

          {/* Reflejo de luz interior inferior derecho */}
          <path 
            d="M 9.5 11.5 A 4 4 0 0 1 5.5 15.5" 
            stroke="#ffffff" 
            strokeWidth="0.65" 
            strokeOpacity="0.5" 
            fill="none" 
            strokeLinecap="round" 
          />
        </motion.svg>
      ) : (
        /* Splash impact ring and spray */
        <motion.div
          className="absolute"
          style={{
            top: viewportHeight - 15,
            left: -drip.size / 2,
            width: drip.size * 2,
            height: drip.size * 2,
          }}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{
            scale: 2.5,
            opacity: 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Ripple wave */}
          <div className="absolute inset-0 rounded-full border border-sky-400/50" />
          {/* Splashes */}
          <div className="absolute top-1/2 left-0 w-1 h-1 rounded-full bg-sky-300/80 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-1 h-1 rounded-full bg-sky-300/80 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-sky-300/80 -translate-x-1/2" />
        </motion.div>
      )}
    </div>
  );
}

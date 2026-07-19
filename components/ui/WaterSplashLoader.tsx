import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterSplashLoaderProps {
  onComplete: () => void;
}

export function WaterSplashLoader({ onComplete }: WaterSplashLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const stateRef = useRef({
    isClicked: false,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }>,
    floodProgress: 0,
    floodY: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    stateRef.current.isClicked = isClicked;
  }, [isClicked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      stateRef.current.width = width;
      stateRef.current.height = height;
      stateRef.current.floodY = height + 100;
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    let animationId: number;

    const render = () => {
      const { width, height, particles } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      if (stateRef.current.isClicked) {
        if (stateRef.current.floodProgress < 0.95) {
          const spoutX = width / 2;
          const spoutY = height / 2 + 118;
          const particlesPerFrame = 4;

          for (let k = 0; k < particlesPerFrame; k++) {
            const angle = Math.random() * Math.PI * 0.14 + Math.PI * 0.43;
            const speed = 7 + Math.random() * 18;

            particles.push({
              x: spoutX,
              y: spoutY,
              vx: Math.cos(angle) * speed * 0.22,
              vy: Math.sin(angle) * speed + 4,
              radius: 2 + Math.random() * 6,
              alpha: 1.0,
              color: k % 2 === 0 ? "rgba(56, 189, 248," : "rgba(14, 165, 233,",
            });
          }
        }

        // Draw Particles without costly shadowBlur or save/restore in loop
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]!;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45;
          p.vx *= 0.98;
          p.alpha -= 0.016;

          if (p.y > stateRef.current.floodY) {
            p.y = stateRef.current.floodY;
            p.vy = -p.vy * 0.22 - Math.random() * 2;
            p.vx += (Math.random() - 0.5) * 4;
            p.radius *= 0.85;
          }

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.fill();
        }

        // Flood Water Wave
        if (stateRef.current.floodProgress < 1) {
          stateRef.current.floodProgress += 0.007;
        }

        const targetY = -120;
        const startY = height + 100;
        stateRef.current.floodY =
          startY - (startY - targetY) * Math.min(1, stateRef.current.floodProgress);

        const currentY = stateRef.current.floodY;
        ctx.beginPath();
        ctx.moveTo(0, currentY);

        const waveCount = 2;
        const waveHeight = 25 * (1 - Math.min(0.95, stateRef.current.floodProgress));
        const time = Date.now() * 0.006;

        for (let x = 0; x <= width; x += 15) {
          const angle = (x / width) * Math.PI * 2 * waveCount + time;
          const y = currentY + Math.sin(angle) * waveHeight;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height + 150);
        ctx.lineTo(0, height + 150);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, currentY, 0, height);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.95)");
        gradient.addColorStop(0.3, "rgba(14, 165, 233, 0.98)");
        gradient.addColorStop(0.7, "rgba(3, 105, 161, 1)");
        gradient.addColorStop(1, "rgba(9, 9, 11, 1)");
        ctx.fillStyle = gradient;
        ctx.fill();

        if (stateRef.current.floodProgress >= 1 && !isFadingOut) {
          setIsFadingOut(true);
          onComplete();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isFadingOut, onComplete]);

  const handleTapClick = () => {
    if (isClicked) return;
    setIsClicked(true);

    const { width, height } = stateRef.current;
    const spoutX = width / 2;
    const spoutY = height / 2 + 118;

    const newParticles = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 0.12 + Math.PI * 0.44;
      const speed = 8 + Math.random() * 14;

      newParticles.push({
        x: spoutX,
        y: spoutY,
        vx: Math.cos(angle) * speed * 0.25,
        vy: Math.sin(angle) * speed + 3,
        radius: 2 + Math.random() * 7,
        alpha: 1,
        color: i % 2 === 0 ? "rgba(56, 189, 248," : "rgba(14, 165, 233,",
      });
    }

    stateRef.current.particles = newParticles;
  };

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          className="fixed inset-0 z-[99999] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          exit={{
            opacity: 0,
            y: "100%",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          />

          <motion.div
            className="absolute inset-0 z-20 cursor-pointer select-none"
            onClick={handleTapClick}
            initial={{ y: "100%" }}
            animate={
              isClicked
                ? {
                    y: "100%",
                    transition: { duration: 0.85, delay: 0.4, ease: [0.76, 0, 0.24, 1] },
                  }
                : {
                    y: 0,
                    transition: { type: "spring", stiffness: 70, damping: 16, mass: 1 },
                  }
            }
          >
            {/* Contenedor del Grifo completo */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[300px] sm:w-[380px] sm:h-[358px]"
              whileHover={!isClicked ? { scale: 1.03 } : {}}
              whileTap={!isClicked ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <img
                src="/tap_body_extended.png"
                alt="Cuerpo del Grifo"
                className="absolute top-0 left-0 w-full h-auto z-10 filter drop-shadow-[0_8px_25px_rgba(0,0,0,0.55)] select-none pointer-events-none"
              />

              <motion.img
                src="/tap_handle_extended.png"
                alt="Manija Roja del Grifo"
                className="absolute top-0 left-0 w-full h-auto z-20 pointer-events-none select-none"
                style={{
                  transformOrigin: "50% 2.743%",
                }}
                initial={{ scale: 0.6, opacity: 0, rotateY: 0 }}
                animate={
                  isClicked
                    ? {
                        rotateY: -720,
                        scale: 1,
                        opacity: 1,
                      }
                    : {
                        rotateY: 0,
                        scale: 1,
                        opacity: 1,
                      }
                }
                transition={
                  isClicked
                    ? {
                        duration: 1.1,
                        ease: [0.25, 1, 0.5, 1],
                      }
                    : {
                        type: "spring",
                        stiffness: 90,
                        damping: 16,
                        delay: 0.25,
                      }
                }
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

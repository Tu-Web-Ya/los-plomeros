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
      stretch: number;
    }>,
    bubbles: [] as Array<{
      x: number;
      y: number;
      radius: number;
      vy: number;
      vx: number;
      alpha: number;
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
      const { width, height, particles, bubbles } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      if (stateRef.current.isClicked) {
        // 1. Continuous stream of realistic transparent water droplets
        if (stateRef.current.floodProgress < 0.95) {
          const spoutX = width / 2;
          const spoutY = height / 2 + 118;
          const particlesPerFrame = 5;

          for (let k = 0; k < particlesPerFrame; k++) {
            const angle = Math.random() * Math.PI * 0.16 + Math.PI * 0.42;
            const speed = 8 + Math.random() * 18;

            particles.push({
              x: spoutX,
              y: spoutY,
              vx: Math.cos(angle) * speed * 0.22,
              vy: Math.sin(angle) * speed + 3.5,
              radius: 2 + Math.random() * 7,
              alpha: 1.0,
              stretch: 1 + speed * 0.08,
            });
          }

          // Spawn floating underwater bubbles in the rising pool
          if (Math.random() > 0.3) {
            bubbles.push({
              x: Math.random() * width,
              y: stateRef.current.floodY + Math.random() * (height - stateRef.current.floodY + 50),
              radius: 1.5 + Math.random() * 4,
              vy: -(1 + Math.random() * 2),
              vx: (Math.random() - 0.5) * 0.8,
              alpha: 0.4 + Math.random() * 0.5,
            });
          }
        }

        // Render Hydrodynamic Transparent Droplets with Specular Rim Highlights
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]!;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.42;
          p.vx *= 0.98;
          p.alpha -= 0.015;

          if (p.y > stateRef.current.floodY) {
            p.y = stateRef.current.floodY;
            p.vy = -p.vy * 0.2 - Math.random() * 1.5;
            p.vx += (Math.random() - 0.5) * 4;
            p.radius *= 0.82;
          }

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          const speedAngle = Math.atan2(p.vy, p.vx);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(speedAngle);

          // Clear Glassy Translucent Water Body
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius * p.stretch, p.radius, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha * 0.35})`;
          ctx.fill();

          // Outer Refractive Sheen
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Crisp White Specular Reflection Highlight Arc
          ctx.beginPath();
          ctx.arc(-p.radius * 0.3, -p.radius * 0.3, p.radius * 0.4, -Math.PI * 0.8, -Math.PI * 0.1);
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.restore();
        }

        // 2. Rising Transparent Water Pool Progress
        if (stateRef.current.floodProgress < 1) {
          stateRef.current.floodProgress += 0.007;
        }

        const targetY = -120;
        const startY = height + 100;
        stateRef.current.floodY =
          startY - (startY - targetY) * Math.min(1, stateRef.current.floodProgress);

        const currentY = stateRef.current.floodY;
        const time = Date.now() * 0.005;

        // Underwater Bubbles Floating Up
        for (let bIdx = bubbles.length - 1; bIdx >= 0; bIdx--) {
          const b = bubbles[bIdx]!;
          b.y += b.vy;
          b.x += b.vx + Math.sin(time + b.y * 0.05) * 0.4;

          if (b.y < currentY) {
            bubbles.splice(bIdx, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.25})`;
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.7})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Layer 1: Translucent Main Fluid Body
        ctx.beginPath();
        ctx.moveTo(0, currentY);

        const waveCount = 2;
        const waveHeight = 22 * (1 - Math.min(0.95, stateRef.current.floodProgress));

        for (let x = 0; x <= width; x += 12) {
          const angle = (x / width) * Math.PI * 2 * waveCount + time;
          const y = currentY + Math.sin(angle) * waveHeight;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height + 150);
        ctx.lineTo(0, height + 150);
        ctx.closePath();

        // High-end Transparent Glassy Liquid Gradient
        const gradient = ctx.createLinearGradient(0, currentY, 0, height);
        gradient.addColorStop(0, "rgba(224, 242, 254, 0.45)");  // Crisp clear surface sheen
        gradient.addColorStop(0.12, "rgba(186, 230, 253, 0.35)"); // Translucent clear water
        gradient.addColorStop(0.45, "rgba(30, 41, 59, 0.75)");   // Deep translucent liquid
        gradient.addColorStop(1, "rgba(9, 9, 11, 0.92)");       // Dark background integration
        ctx.fillStyle = gradient;
        ctx.fill();

        // Layer 2: Glowing Specular Reflection Crest Line on Surface Wave
        ctx.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const angle = (x / width) * Math.PI * 2 * waveCount + time;
          const y = currentY + Math.sin(angle) * waveHeight;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Layer 3: Secondary Shimmer Wave Line just below surface
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const angle = (x / width) * Math.PI * 2.4 * waveCount - time * 1.3;
          const y = currentY + 6 + Math.cos(angle) * (waveHeight * 0.7);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

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
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 0.16 + Math.PI * 0.42;
      const speed = 8 + Math.random() * 16;

      newParticles.push({
        x: spoutX,
        y: spoutY,
        vx: Math.cos(angle) * speed * 0.25,
        vy: Math.sin(angle) * speed + 3,
        radius: 2 + Math.random() * 7,
        alpha: 1,
        stretch: 1.2 + speed * 0.08,
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

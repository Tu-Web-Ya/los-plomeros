import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterSplashLoaderProps {
  onComplete: () => void;
}

export function WaterSplashLoader({ onComplete }: WaterSplashLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Referencias mutables para el loop de físicas del Canvas
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar dimensiones del canvas
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
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

      // 1. GENERACIÓN CONTINUA Y ANIMACIÓN DE GOTAS DE AGUA (Fase 2)
      if (stateRef.current.isClicked) {
        // Generar chorro de agua continuo en cada frame mientras sube el nivel
        if (stateRef.current.floodProgress < 0.95) {
          const spoutX = width / 2;
          const spoutY = height / 2 + 118; // Punto de unión del grifo central
          const particlesPerFrame = 8; // Aumentado para un chorro mucho más denso

          for (let k = 0; k < particlesPerFrame; k++) {
            // Ángulo hacia abajo con sutil dispersión
            const angle = Math.random() * Math.PI * 0.14 + Math.PI * 0.43;
            const speed = 7 + Math.random() * 20;

            particles.push({
              x: spoutX,
              y: spoutY,
              vx: Math.cos(angle) * speed * 0.22,
              vy: Math.sin(angle) * speed + 4,
              radius: 2 + Math.random() * 8,
              alpha: 1.0,
              color: k % 2 === 0 ? "rgba(56, 189, 248, 1)" : "rgba(14, 165, 233, 1)",
            });
          }
        }

        // Animar y dibujar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.45; // Gravedad
          p.vx *= 0.98;
          p.alpha -= 0.014; // Desvanecimiento progresivo

          // Colisión física con el nivel del agua que sube
          if (p.y > stateRef.current.floodY) {
            p.y = stateRef.current.floodY;
            p.vy = -p.vy * 0.22 - (Math.random() * 2); // Rebote vertical
            p.vx += (Math.random() - 0.5) * 5; // Salpicadura horizontal
            p.radius *= 0.85; // Se reduce de tamaño al salpicar
          }

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace("1)", `${p.alpha})`);
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(14, 165, 233, 0.45)"; // Brillo de agua azul
          ctx.fill();
          ctx.restore();
        }

        // 2. INUNDACIÓN DE LA PANTALLA (Agua subiendo)
        if (stateRef.current.floodProgress < 1) {
          // Acelerado para que sea más dinámico y retenga la atención del usuario
          stateRef.current.floodProgress += 0.006;
        }

        const targetY = -120; // Llena por completo
        const startY = height + 100;
        stateRef.current.floodY = startY - (startY - targetY) * Math.min(1, stateRef.current.floodProgress);

        ctx.save();
        ctx.beginPath();
        
        const currentY = stateRef.current.floodY;
        ctx.moveTo(0, currentY);

        // Simulación matemática del oleaje
        const waveCount = 2.5;
        const waveHeight = 30 * (1 - Math.min(0.95, stateRef.current.floodProgress));
        const time = Date.now() * 0.007;

        for (let x = 0; x <= width; x += 10) {
          const angle = (x / width) * Math.PI * 2 * waveCount + time;
          const y = currentY + Math.sin(angle) * waveHeight;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height + 150);
        ctx.lineTo(0, height + 150);
        ctx.closePath();

        // Agua azul cristalina degradada
        const gradient = ctx.createLinearGradient(0, currentY, 0, height);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.95)");  // Celeste brillante (sky-300)
        gradient.addColorStop(0.3, "rgba(14, 165, 233, 0.98)"); // Azul agua (sky-500)
        gradient.addColorStop(0.7, "rgba(3, 105, 161, 1)");     // Azul profundo (sky-750)
        gradient.addColorStop(1, "rgba(9, 9, 11, 1)");          // Fondo oscuro del sitio
        ctx.fillStyle = gradient;
        
        ctx.shadowBlur = 30;
        ctx.shadowColor = "rgba(14, 165, 233, 0.6)";
        ctx.fill();
        ctx.restore();

        // 3. FINALIZAR Y REVELAR SITIO
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

  // Manejar apertura de la llave
  const handleTapClick = () => {
    if (isClicked) return;
    setIsClicked(true);

    const { width, height } = stateRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    // Con el grifo en el centro de la pantalla, la salida está a +118px del centro vertical
    const spoutX = width / 2;
    const spoutY = height / 2 + 118;

    // Generar ráfaga inicial de agua (pop instantáneo denso)
    const newParticles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 0.12 + Math.PI * 0.44; 
      const speed = 8 + Math.random() * 15;
      
      newParticles.push({
        x: spoutX,
        y: spoutY,
        vx: Math.cos(angle) * speed * 0.25,
        vy: Math.sin(angle) * speed + 3,
        radius: 2 + Math.random() * 8,
        alpha: 1,
        color: i % 2 === 0 ? "rgba(56, 189, 248, 1)" : "rgba(14, 165, 233, 1)",
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
          transition={{ duration: 0.4 }}
          exit={{ 
            opacity: 0,
            y: "100%", // Drenado fluido hacia abajo
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Canvas de Físicas del Agua (en z-30 para estar al frente de la tubería) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          />
 
          {/* Interfaz de la Llave de Bronce */}
          <motion.div 
            className="absolute inset-0 z-20 cursor-pointer select-none"
            onClick={handleTapClick}
            initial={{ y: "100%" }}
            animate={isClicked ? { 
              y: "100%", 
              transition: { duration: 0.85, delay: 0.4, ease: [0.76, 0, 0.24, 1] } 
            } : { 
              y: 0,
              transition: { type: "spring", stiffness: 60, damping: 14, mass: 1.1 }
            }}
          >
            {/* Contenedor del Grifo completo (para que cuerpo y mango escalen juntos) */}
            <motion.div
              className="absolute left-1/2 w-80 h-[300px] sm:w-[380px] sm:h-[358px]"
              style={{
                top: "50%",
                perspective: 1000,
                transformStyle: "preserve-3d",
              }}
              initial={{ x: "-50%", y: "-50%" }}
              whileHover={!isClicked ? { scale: 1.03 } : {}}
              whileTap={!isClicked ? { scale: 0.97 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Cuerpo del Grifo de Bronce Real (Tubería extendida) */}
              <img 
                src="/tap_body_extended.png" 
                alt="Cuerpo del Grifo" 
                className="absolute top-0 left-0 w-full h-auto z-10 filter drop-shadow-[0_8px_25px_rgba(0,0,0,0.55)] select-none pointer-events-none"
              />
 
              {/* Mango Rojo del Grifo que Rota Horizontalmente en 3D (Eje Y) */}
              <motion.img 
                src="/tap_handle_extended.png" 
                alt="Manija Roja del Grifo" 
                className="absolute top-0 left-0 w-full h-auto z-20 pointer-events-none select-none"
                style={{
                  transformOrigin: "50% 2.743%", // Centrado vertical en la manija (95px / 3463px)
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                initial={{ scale: 0.6, opacity: 0, rotateY: 0 }}
                animate={isClicked ? {
                  rotateY: -720,
                  scale: 1,
                  opacity: 1,
                } : {
                  rotateY: 0,
                  scale: 1,
                  opacity: 1,
                }}
                transition={isClicked ? {
                  duration: 1.2,
                  ease: "easeInOut"
                } : {
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: 0.35 // Escala y aparece después de que el grifo sube
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

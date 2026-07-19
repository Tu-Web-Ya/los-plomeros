import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      "Cisternas",
      "Calentadores",
      "Filtraciones",
      "Destapes",
      "Certificaciones",
      "Tuberías",
      "Remodelaciones"
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden py-24 md:py-32">
      {/* Imagen de fondo texturizada con overlay oscuro y viñetado para máxima legibilidad */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 opacity-50 filter brightness-75 contrast-125"
        style={{ 
          backgroundImage: "url('/hero-bg.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,9,11,0.9)_100%)] z-10 pointer-events-none" />



      <div className="container mx-auto px-4 relative z-20">
        <div className="flex gap-8 items-center justify-center flex-col text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: 15 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 12,
              delay: 0.15 
            }}
            className="border-[3px] border-red-600 text-red-500 font-black text-[11px] sm:text-xs px-4 py-2 uppercase tracking-[0.2em] rounded-sm bg-red-950/15 backdrop-blur-sm shadow-md select-none border-double outline outline-1 outline-red-600/30 outline-offset-2 mb-2"
          >
            Servicio de Emergencia 24/7
          </motion.div>
          
          <div className="flex gap-6 flex-col max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-8xl tracking-tight font-extrabold text-white leading-[1.1] md:leading-[1.05]">
              <span className="block font-bold">PLOMERÍA</span>
              <span className="relative flex w-full justify-center overflow-hidden min-h-[50px] sm:min-h-[75px] md:min-h-[95px] py-1 text-center font-black">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 w-full left-0 right-0 text-center text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 60, damping: 12 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="block text-2xl sm:text-4xl md:text-5xl font-medium text-zinc-300 tracking-normal mt-4">
                DE CONFIANZA
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-zinc-400 max-w-2xl mx-auto font-medium">
              Soluciones rápidas, limpias y profesionales para cualquier problema de plomería. No cobramos tarifas sorpresa, te damos tranquilidad absoluta.
            </p>
          </div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="gap-3 bg-red-600 hover:bg-red-700 text-white font-bold text-base px-8 py-6 h-auto shadow-lg shadow-red-900/30 transition-all border border-red-500 hover:scale-105"
              onClick={() => window.location.href = "tel:+17879001404"}
            >
              <PhoneCall className="w-5 h-5" /> Llamar ahora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-3 bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 font-semibold text-base px-8 py-6 h-auto transition-all hover:scale-105"
              onClick={() => {
                const contactSec = document.getElementById("contact");
                if (contactSec) contactSec.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Calendar className="w-5 h-5" /> Sacar cita online
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { Hero };

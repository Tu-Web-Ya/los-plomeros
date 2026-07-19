import React from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { IPhoneMockup } from "./iphone-mockup";

export function CallScreenIPhone({ scale = 0.22, className = "" }: { scale?: number; className?: string }) {
  const scaledWidth = 417 * scale;
  const scaledHeight = 876 * scale;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      {/* Ondas de vibración/sonido alrededor del celular */}
      {/* Ondas Izquierdas */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[25%] pointer-events-none flex flex-col gap-2 items-end z-0">
        <motion.div
          className="w-4 h-12 rounded-full border-r-2 border-zinc-100/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="w-6 h-18 rounded-full border-r-2 border-zinc-100/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.5, 0.05] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Ondas Derechas */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[25%] pointer-events-none flex flex-col gap-2 items-start z-0">
        <motion.div
          className="w-4 h-12 rounded-full border-l-2 border-zinc-100/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="w-6 h-18 rounded-full border-l-2 border-zinc-100/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.5, 0.05] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
        />
      </div>

      {/* Celular con vibración */}
      <motion.div
        className="relative z-10"
        style={{ width: scaledWidth, height: scaledHeight }}
        animate={{
          x: [0, -3, 3, -3, 3, -3, 3, -3, 3, -3, 3, 0, 0, 0, 0, 0, 0],
          y: [0, 2, -2, 2, -2, 2, -2, 2, -2, 2, -2, 0, 0, 0, 0, 0, 0],
          rotate: [0, -2, 2, -2, 2, -2, 2, -2, 2, -2, 2, 0, 0, 0, 0, 0, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <IPhoneMockup
          model="15-pro"
          color="space-black"
          scale={scale}
          safeArea={false}
          screenBg="#000000"
          showHomeIndicator={true}
          innerShadow={true}
          shadow={true}
        >
          {/* Pantalla del iPhone 15 Pro (con dimensiones lógicas de 393 x 852) */}
          <div className="w-full h-full flex flex-col justify-between pt-16 pb-14 px-6 text-center select-none bg-black relative">
            
            {/* Bloque Superior de Textos */}
            <div className="flex flex-col items-center mt-4">
              <span className="text-[10px] tracking-[0.25em] font-black text-zinc-500 uppercase">
                Llamada Entrante
              </span>
              <h3 className="text-2xl font-black text-white mt-3 tracking-wide leading-none">
                LOS PLOMEROS 24/7
              </h3>
              <span className="text-sky-400 text-sm font-bold mt-2">
                (787) 900-1404
              </span>
            </div>

            {/* Centro Completamente Vacío y Negro */}
            <div className="flex-1" />

            {/* Bloque Inferior con Botones Detallados */}
            <div className="flex justify-between items-end w-full px-2 mb-4">
              
              {/* Botón Rechazar */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer overflow-hidden group">
                  {/* Brillo especular 3D */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none" />
                  {/* Aro decorativo */}
                  <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
                  {/* Icono de colgar */}
                  <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400">
                  Rechazar
                </span>
              </div>

              {/* Botón Aceptar */}
              <div className="flex flex-col items-center gap-2 relative">
                {/* Ondas concéntricas de vibración */}
                <motion.div
                  className="absolute w-16 h-16 rounded-full border border-green-500/80 pointer-events-none z-0"
                  style={{ top: 0, left: 0 }}
                  animate={{ scale: [1, 1.55], opacity: [0.85, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute w-16 h-16 rounded-full border border-green-500/50 pointer-events-none z-0"
                  style={{ top: 0, left: 0 }}
                  animate={{ scale: [1, 1.3], opacity: [0.65, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
                />
                
                <div className="relative w-16 h-16 rounded-full bg-green-500 border border-green-400 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer overflow-hidden group z-10">
                  {/* Brillo especular 3D */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/15 pointer-events-none" />
                  {/* Aro decorativo */}
                  <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
                  {/* Icono de aceptar */}
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-green-500">
                  Aceptar
                </span>
              </div>

            </div>

          </div>
        </IPhoneMockup>
      </motion.div>
    </div>
  );
}

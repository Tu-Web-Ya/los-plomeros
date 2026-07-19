import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export function EmergencyBannerReplica() {
  return (
    <section className="bg-black py-16 px-4 md:px-8 border-t border-b border-zinc-900 flex items-center justify-center w-full">
      {/* Tarjeta rectangular central de color rojo vibrante */}
      <div 
        className="w-full max-w-6xl rounded-[15px] bg-gradient-to-br from-[#dc2626] via-[#ef4444] to-[#b91c1c] p-6 md:p-10 relative overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-red-500/20"
        style={{
          background: "radial-gradient(circle at 30% 50%, #f43f5e 0%, #ef4444 35%, #991b1b 100%)"
        }}
      >
        {/* Resplandor ambiental de la baliza */}
        <div className="absolute top-1/2 left-[15%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(239,68,68,0.4)_40%,transparent_70%)] pointer-events-none blur-3xl z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* SECCIÓN II: Elementos Visuales de Emergencia (Baliza SVG a la izquierda) */}
          <div className="col-span-1 lg:col-span-4 flex justify-center items-center relative min-h-[220px]">
            {/* Baliza Activa con Haces de Luz en 'X' */}
            <div className="absolute w-[360px] h-[360px] flex items-center justify-center overflow-visible pointer-events-none">
              <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
                <defs>
                  {/* Difuminado de movimiento (motion blur) para los haces en 'X' */}
                  <filter id="motionBlurX" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="16" />
                  </filter>

                  {/* Gradientes lineales para los haces de luz */}
                  <linearGradient id="beamX1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffc1c1" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="beamX2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffc1c1" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
                  </linearGradient>

                  {/* Gradiente de la cúpula de cristal rojo */}
                  <linearGradient id="glassDome" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#991b1b" />
                    <stop offset="30%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#fca5a5" />
                    <stop offset="70%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>

                  {/* Gradiente del reflector cromado interno */}
                  <linearGradient id="reflectorChrome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e4e4e7" />
                    <stop offset="40%" stopColor="#a1a1aa" />
                    <stop offset="60%" stopColor="#3f3f46" />
                    <stop offset="100%" stopColor="#f4f4f5" />
                  </linearGradient>
                </defs>

                {/* 1. Haces de Luz en forma de 'X' (Activos y Rotando levemente en vaivén) */}
                <motion.g
                  filter="url(#motionBlurX)"
                  animate={{
                    rotate: [-3, 3, -3],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Línea 1 de la 'X' */}
                  <line x1="20" y1="20" x2="280" y2="280" stroke="url(#beamX1)" strokeWidth="24" strokeLinecap="round" />
                  {/* Línea 2 de la 'X' */}
                  <line x1="20" y1="280" x2="280" y2="20" stroke="url(#beamX2)" strokeWidth="24" strokeLinecap="round" />
                </motion.g>

                {/* 2. Cuerpo de la Baliza Montada (Renderizado SVG fotorrealista) */}
                <g transform="translate(70, 70)">
                  {/* Base de plástico negro en escalones */}
                  <path d="M 40 135 L 120 135 L 112 152 L 48 152 Z" fill="#0c0c0e" stroke="#1f2937" strokeWidth="1" />
                  <rect x="36" y="125" width="88" height="10" rx="2" fill="#18181b" />
                  <rect x="42" y="118" width="76" height="7" rx="1" fill="#09090b" />
                  
                  {/* Reflector cromado metálico interno */}
                  <ellipse cx="80" cy="85" rx="22" ry="18" fill="url(#reflectorChrome)" stroke="#27272a" strokeWidth="0.5" />
                  
                  {/* Bombilla central incandescente activa */}
                  <motion.circle 
                    cx="80" 
                    cy="82" 
                    r="8" 
                    fill="#ffffff" 
                    className="shadow-2xl"
                    animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <circle cx="80" cy="82" r="14" fill="#fef08a" opacity="0.35" />

                  {/* Cúpula roja de cristal acrílico fotorrealista */}
                  <path 
                    d="M 46 118 C 46 60, 114 60, 114 118 Z" 
                    fill="url(#glassDome)" 
                    fillOpacity="0.82" 
                    stroke="#b91c1c" 
                    strokeWidth="1.5" 
                  />
                  
                  {/* Reflejos de luz especular en el domo de cristal */}
                  <path d="M 52 110 C 52 75, 70 70, 70 65" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M 108 108 C 108 90, 102 85, 102 80" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4" />
                </g>
              </svg>
            </div>
          </div>

          {/* SECCIÓN III: Bloque de Texto (CSS Alinado a la izquierda) */}
          <div className="col-span-1 lg:col-span-5 text-left flex flex-col items-start justify-center relative z-10 md:pl-4">
            {/* Texto Superior (Gris) */}
            <span 
              className="tracking-[0.2em] font-black block mb-2 uppercase"
              style={{ fontSize: "14px", color: "#555555" }}
            >
              ATENCIÓN INMEDIATA
            </span>

            {/* Texto Principal (Blanco Bold) */}
            <h2 
              className="text-white tracking-wide mb-3 block text-shadow-md"
              style={{ fontSize: "32px", fontWeight: "bold", lineHeight: "1.15" }}
            >
              ¡EMERGENCIA 24/7!
            </h2>

            {/* Texto Descriptivo (Blanco) */}
            <p 
              className="text-white font-medium mb-6 leading-relaxed"
              style={{ fontSize: "18px" }}
            >
              ¿Inundaciones, goteras graves o drenajes tapados? Llegamos en menos de 30 minutos a todo <strong className="text-white font-black">Puerto Rico</strong>.
            </p>

            {/* SECCIÓN IV: Botón de Llamada (CSS rectangular blanco con bordes de 10px) */}
            <a 
              href="tel:+17879001404"
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200/50"
              style={{ 
                backgroundColor: "#FFFFFF", 
                borderRadius: "10px",
                color: "#dc2626"
              }}
            >
              <Phone className="w-5 h-5 fill-[#dc2626] text-[#dc2626]" />
              <span className="font-extrabold text-sm tracking-wide">
                Llama Ahora: (787) 900-1404
              </span>
            </a>
          </div>

          {/* SECCIÓN V: Teléfono (Fotorrealista a la derecha) */}
          <div className="col-span-1 lg:col-span-3 flex justify-center items-center relative min-h-[280px]">
            {/* Contenedor del celular con vibración física suave */}
            <motion.div
              className="relative w-[185px] h-[275px] flex items-center justify-center"
              animate={{
                y: [0, -3, 0, 3, 0],
                rotate: [0, -1, 0, 1, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Sombra del dispositivo */}
              <div className="absolute inset-0 bg-black/60 rounded-[28px] blur-xl pointer-events-none translate-y-4 scale-95" />

              {/* Teléfono gris oscuro tipo iPhone 15 Pro Max */}
              <div 
                className="w-full h-full rounded-[28px] bg-gradient-to-br from-[#27272a] via-[#18181b] to-[#3f3f46] p-[6px] relative border border-[#e4e4e7]/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] flex flex-col justify-between overflow-hidden"
              >
                {/* SECCIÓN VI: Reflejo sutil de la baliza roja sobre el chasis izquierdo */}
                <div className="absolute top-0 left-0 bottom-0 w-[12px] bg-gradient-to-r from-red-600/30 to-transparent pointer-events-none z-30 rounded-l-[22px]" />

                {/* Pantalla encendida con fondo negro */}
                <div 
                  className="w-full h-full rounded-[23px] bg-black p-4 flex flex-col justify-between items-center relative overflow-hidden"
                  style={{ backgroundColor: "#000000" }}
                >
                  {/* Dynamic Island superior */}
                  <div className="w-12 h-3.5 bg-black rounded-full absolute top-1.5 left-1/2 -translate-x-1/2 border border-zinc-800/60 z-20" />

                  {/* Interfaz de llamada entrante */}
                  <div className="flex flex-col items-center mt-6 w-full text-center relative z-10">
                    <span className="text-[7.5px] font-bold text-zinc-500 tracking-[0.15em] mb-1.5 uppercase block">
                      LLAMADA ENTRANTE
                    </span>
                    <h3 className="text-white text-[10.5px] font-black tracking-wide leading-tight mb-1">
                      LOS PLOMEROS 24/7
                    </h3>
                    <span className="text-zinc-300 text-[8px] font-semibold">
                      (787) 900-1404
                    </span>
                  </div>

                  {/* Icono decorativo de casa/llave de plomería */}
                  <div className="w-10 h-10 rounded-full bg-zinc-900/40 border border-zinc-800/40 flex items-center justify-center opacity-30 my-auto">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>

                  {/* Alerta roja: Notificación activada */}
                  <div className="w-full flex items-center justify-center mb-5 relative z-10">
                    <span className="text-[7.5px] font-bold text-[#ef4444] bg-red-950/20 px-2 py-0.5 rounded-full border border-red-900/30 tracking-wider">
                      Notificación activada
                    </span>
                  </div>

                  {/* Botones circulares inferiores de Aceptar y Rechazar */}
                  <div className="w-full flex justify-between items-center px-2 pb-1 relative z-10">
                    {/* Botón Rechazar (Rojo) */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-full bg-[#ef4444] border border-red-500/20 flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white transform rotate-[135deg]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <span className="text-[6.5px] font-semibold text-zinc-400">Rechazar</span>
                    </div>

                    {/* Botón Aceptar (Verde) */}
                    <div className="flex flex-col items-center gap-1">
                      <motion.div 
                        className="w-9 h-9 rounded-full bg-[#22c55e] border border-green-500/20 flex items-center justify-center shadow-lg relative"
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </motion.div>
                      <span className="text-[6.5px] font-semibold text-green-500">Aceptar</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

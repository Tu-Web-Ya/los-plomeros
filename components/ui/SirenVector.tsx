import { motion } from "framer-motion";

export function SirenVector({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 160 180" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sirenBackgroundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(239, 68, 68, 0.7)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
        </radialGradient>
        
        <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="6%" stopColor="#71717a" />
          <stop offset="12%" stopColor="#e4e4e7" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#a1a1aa" />
          <stop offset="38%" stopColor="#27272a" />
          <stop offset="55%" stopColor="#52525b" />
          <stop offset="68%" stopColor="#e4e4e7" />
          <stop offset="78%" stopColor="#ffffff" />
          <stop offset="88%" stopColor="#71717a" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>

        <linearGradient id="chromeVertGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="15%" stopColor="rgba(255,255,255,0)" />
          <stop offset="85%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
        </linearGradient>

        <linearGradient id="rubberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#09090b" />
          <stop offset="15%" stopColor="#27272a" />
          <stop offset="50%" stopColor="#3f3f46" />
          <stop offset="85%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        <radialGradient id="mirrorGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b91c1c" />
          <stop offset="50%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#180202" />
        </radialGradient>

        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(153, 27, 27, 0.98)" />
          <stop offset="8%" stopColor="rgba(185, 28, 28, 0.95)" />
          <stop offset="28%" stopColor="rgba(220, 38, 38, 0.8)" />
          <stop offset="42%" stopColor="rgba(239, 68, 68, 0.55)" />
          <stop offset="50%" stopColor="rgba(254, 226, 226, 0.5)" />
          <stop offset="58%" stopColor="rgba(239, 68, 68, 0.55)" />
          <stop offset="72%" stopColor="rgba(220, 38, 38, 0.8)" />
          <stop offset="92%" stopColor="rgba(185, 28, 28, 0.95)" />
          <stop offset="100%" stopColor="rgba(127, 29, 29, 0.98)" />
        </linearGradient>

        <radialGradient id="glassCapGrad" cx="50%" cy="25%" r="65%">
          <stop offset="0%" stopColor="rgba(254, 226, 226, 0.9)" />
          <stop offset="35%" stopColor="rgba(239, 68, 68, 0.95)" />
          <stop offset="75%" stopColor="rgba(185, 28, 28, 0.98)" />
          <stop offset="100%" stopColor="rgba(127, 29, 29, 1)" />
        </radialGradient>

        <radialGradient id="bulbGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#ffedd5" />
          <stop offset="55%" stopColor="rgba(255, 235, 235, 0.95)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
        </radialGradient>

        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
          <stop offset="35%" stopColor="rgba(239, 68, 68, 0.5)" />
          <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
        </linearGradient>

        <linearGradient id="sheenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <motion.circle 
        cx="80" 
        cy="74" 
        r="75" 
        fill="url(#sirenBackgroundGlow)"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.95, 0.5] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.path
        d="M 80 74 L 15 180 L 145 180 Z"
        fill="url(#beamGrad)"
        style={{ originX: "80px", originY: "74px" }}
        animate={{ rotate: [-45, 45, -45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.ellipse 
        cx="80" 
        cy="72" 
        rx="35" 
        ry="32" 
        fill="url(#mirrorGrad)" 
        stroke="#7f1d1d" 
        strokeWidth="1"
        animate={{
          x: [-12, 12, -12],
          scaleX: [1, 0.1, 1, 0.1, 1],
        }}
        transition={{
          duration: 2.0,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <path d="M 72 88 Q 80 90 88 88 L 86 102 Q 80 104 74 102 Z" fill="url(#chromeGrad)" />
      <path d="M 72 88 Q 80 90 88 88 L 86 102 Q 80 104 74 102 Z" fill="url(#chromeVertGrad)" />
      <ellipse cx="80" cy="88" rx="8" ry="1.5" fill="#52525b" />
      <ellipse cx="80" cy="91" rx="7.5" ry="1.2" fill="#27272a" />

      <motion.circle 
        cx="80" 
        cy="71" 
        r="28" 
        fill="url(#bulbGlowGrad)" 
        animate={{
          scale: [0.9, 1.18, 0.9],
          opacity: [0.65, 1, 0.65]
        }}
        transition={{
          duration: 1.0,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <path d="M 73 88 C 70 82, 70 65, 80 65 C 90 65, 90 82, 87 88 Z" fill="rgba(255, 255, 255, 0.28)" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.75" />
      <path d="M 75 75 C 73 70, 75 67, 80 66" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />

      <path d="M 33 112 L 36 44 C 36 24, 46 14, 80 14 C 114 14, 124 24, 124 44 L 127 112 Q 80 120 33 112 Z" fill="url(#glassGrad)" />
      <path d="M 33 112 L 36 44 C 36 24, 46 14, 80 14 C 114 14, 124 24, 124 44 L 127 112 Q 80 120 33 112 Z" fill="url(#glassCapGrad)" opacity="0.65" style={{ mixBlendMode: "multiply" }} />

      <path d="M 38 48 C 38 48, 41 106, 41 106 C 41 106, 46 107, 46 107 C 46 107, 43 48, 43 48 Z" fill="url(#sheenGrad)" opacity="0.68" />
      <path d="M 35 60 C 35 60, 37 100, 37 100" fill="none" stroke="#ffffff" strokeWidth="0.75" opacity="0.38" />
      
      <path d="M 122 48 C 122 48, 119 106, 119 106 C 119 106, 115 107, 115 107 C 115 107, 118 48, 118 48 Z" fill="url(#sheenGrad)" opacity="0.2" />

      <path d="M 43 40 C 47 28, 59 22, 76 21 C 76 21, 74 24, 74 24 C 60 25, 50 30, 45 42 Z" fill="#ffffff" opacity="0.6" />
      <ellipse cx="106" cy="32" rx="12" ry="5" transform="rotate(-15 106 32)" fill="#ffffff" opacity="0.18" />

      <path d="M 44 95 Q 80 102 116 95 L 117 99 Q 80 106 43 99 Z" fill="#ffffff" opacity="0.2" />
      <path d="M 46 102 Q 80 108 114 102 L 115 104 Q 80 110 45 104 Z" fill="#ffffff" opacity="0.28" />

      <path d="M 33 112 Q 80 120 127 112 L 128 118 Q 80 126 32 118 Z" fill="url(#chromeGrad)" />
      <path d="M 33 112 Q 80 120 127 112 L 128 118 Q 80 126 32 118 Z" fill="url(#chromeVertGrad)" />
      
      <path d="M 33 112 Q 80 120 127 112" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.75" />

      <path d="M 32 118 C 32 118, 22 134, 22 138 C 22 144, 45 152, 80 152 C 115 152, 138 144, 138 138 C 138 134, 128 118, 128 118 Q 80 126 32 118 Z" fill="url(#chromeGrad)" />
      <path d="M 32 118 C 32 118, 22 134, 22 138 C 22 144, 45 152, 80 152 C 115 152, 138 144, 138 138 C 138 134, 128 118, 128 118 Q 80 126 32 118 Z" fill="url(#chromeVertGrad)" />

      <path d="M 22 138 Q 80 148 138 138" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.25" />
      <path d="M 20 146 Q 80 155 140 146" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />

      <path d="M 20 146 Q 80 155 140 146 L 141 155 Q 80 164 19 155 Z" fill="url(#rubberGrad)" />
      <path d="M 19 155 Q 80 164 141 155" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
    </svg>
  );
}

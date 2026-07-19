import React, { useState, useEffect } from "react";
import { 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Star,
  Flame,
  Droplet,
  Wrench,
  FileCheck,
  Building,
  ArrowRight,
  Clock,
  ThumbsUp,
  PhoneCall
} from "lucide-react";
import { Hero } from "../components/ui/animated-hero";
import { Button } from "../components/ui/button";
import { WaterSplashLoader } from "../components/ui/WaterSplashLoader";
import { CeilingDrips } from "../components/ui/CeilingDrips";
import { FeaturesSectionWithHoverEffects } from "../components/ui/feature-section-with-hover-effects";
import { SirenVector } from "../components/ui/SirenVector";
import { CallScreenIPhone } from "../components/ui/CallScreenIPhone";
import { motion } from "framer-motion";

function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [showLoader, setShowLoader] = useState(true);

  // Navegación con scroll suave
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  // Scrollspy para actualizar el enlace activo en el header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const servicesSection = document.getElementById("services");
      const aboutSection = document.getElementById("about");
      const contactSection = document.getElementById("contact");

      const servicesTop = servicesSection ? servicesSection.offsetTop - 200 : 0;
      const aboutTop = aboutSection ? aboutSection.offsetTop - 200 : 0;
      const contactTop = contactSection ? contactSection.offsetTop - 200 : 0;

      if (scrollY >= contactTop) {
        setActiveSection("contact");
      } else if (scrollY >= aboutTop) {
        setActiveSection("about");
      } else if (scrollY >= servicesTop) {
        setActiveSection("services");
      } else {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <WaterSplashLoader onComplete={() => setShowLoader(false)} />
      
      <motion.div 
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={
          showLoader 
            ? { opacity: 0, filter: "blur(8px)" } 
            : { opacity: 1, filter: "blur(0px)" }
        }
        transition={{ 
          duration: 0.45, 
          delay: showLoader ? 0 : 0.45, 
          ease: "easeOut"
        }}
        className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-500 selection:text-white"
      >
        {!showLoader && <CeilingDrips />}
      
      {/* HEADER & NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-900/50 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden border border-zinc-800 shadow-md">
              <img src="/logo.jpg" alt="Los Plomeros Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Los <span className="text-red-500">PLOMEROS</span>
            </span>
          </div>

          {/* Menú de Navegación */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#home" 
              onClick={(e) => handleNavClick(e, "home")}
              className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                activeSection === "home" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Inicio
              {activeSection === "home" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </a>
            <a 
              href="#services" 
              onClick={(e) => handleNavClick(e, "services")}
              className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                activeSection === "services" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Servicios
              {activeSection === "services" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, "about")}
              className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                activeSection === "about" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Nosotros
              {activeSection === "about" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, "contact")}
              className={`text-sm font-semibold tracking-wide transition-all relative py-2 ${
                activeSection === "contact" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Contacto
              {activeSection === "contact" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
              )}
            </a>
          </nav>

          {/* Botón CTA */}
          <div className="flex items-center">
            <a 
              href="tel:+17879001404" 
              className="text-xs sm:text-sm font-bold border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-white py-2 px-4 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
              Llama 24/7: (787) 900-1404
            </a>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow">
        
        {/* SECCIÓN 1: HERO */}
        <section id="home">
          <Hero />
        </section>

        <section id="services" className="py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-16">
              <span className="text-red-500 font-extrabold text-xs tracking-[0.3em] uppercase block mb-2">
                Servicios Profesionales
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
                Soluciones de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Plomería Premium</span>
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg mt-4 leading-relaxed font-medium">
                Atendemos urgencias residenciales y comerciales con técnicos certificados y tecnología avanzada de inspección no invasiva.
              </p>
            </div>

            {/* Grid de Servicios con Efectos de Hover */}
            <FeaturesSectionWithHoverEffects />
          </div>
        </section>

        {/* SECCIÓN 3: EMERGENCY BANNER (HTML/CSS Animado con fondo rojo completo) */}
        <section className="bg-gradient-to-r from-red-900 via-red-600 to-red-850 py-20 px-4 text-center relative overflow-hidden border-t border-b border-white/10 shadow-2xl">
          {/* Flares de luz decorativos de sirena */}
          <motion.div
            className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none rounded-full blur-3xl"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4.0, repeat: Infinity, ease: "linear" }}
          />

          <div className="container mx-auto max-w-6xl relative z-10">
            {/* Contenedor de iconos para Móvil (aparece solo en móvil arriba del texto) */}
            <div className="flex items-center justify-center gap-12 md:hidden mb-12 items-center">
              {/* Sirena Móvil con luz rotativa horizontal */}
              <div className="relative w-24 h-24 flex items-center justify-center overflow-visible">
                <motion.div
                  className="absolute w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(239,68,68,0.5)_0%,rgba(239,68,68,0)_70%)] pointer-events-none blur-2xl z-0"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Dos haces de luz triangulares rotando horizontalmente en 3D Móvil */}
                <motion.div
                  className="absolute pointer-events-none z-0 blur-lg"
                  style={{
                    width: "350px",
                    height: "120px",
                    transformOrigin: "center center",
                  }}
                  animate={{
                    scaleX: [1, 0.05, -1, 0.05, 1],
                    opacity: [0.75, 1.0, 0.75, 0.35, 0.75],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                    <defs>
                      <radialGradient id="doubleBeamGradMobile" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="20%" stopColor="#ff4444" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Triángulo Izquierdo */}
                    <polygon points="150,50 15,10 15,90" fill="url(#doubleBeamGradMobile)" />
                    {/* Triángulo Derecho */}
                    <polygon points="150,50 285,10 285,90" fill="url(#doubleBeamGradMobile)" />
                  </svg>
                </motion.div>
                <SirenVector className="w-20 h-24 drop-shadow-[0_8px_25px_rgba(0,0,0,0.55)] relative z-10" />
              </div>

              {/* Teléfono Móvil (iPhone 15 Pro Mockup Vibrando) */}
              <div className="relative w-16 h-28 flex items-center justify-center">
                <CallScreenIPhone scale={0.12} className="mx-auto" />
              </div>
            </div>

            {/* Layout de 3 columnas para Escritorio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* Lado Izquierdo: Sirena Vector con Haces de Luz Triangulares Rotativos */}
              <div className="hidden md:flex justify-center relative items-center w-full h-48 overflow-visible">
                {/* Aura de fondo pulsante de la sirena */}
                <motion.div
                  className="absolute w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(239,68,68,0.5)_0%,rgba(239,68,68,0)_70%)] pointer-events-none blur-3xl z-0"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.85, 0.6] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Dos haces de luz triangulares rotando horizontalmente en 3D (Efecto Bombero) */}
                <motion.div
                  className="absolute pointer-events-none z-0 blur-xl"
                  style={{
                    width: "700px",
                    height: "220px",
                    transformOrigin: "center center",
                  }}
                  animate={{
                    scaleX: [1, 0.05, -1, 0.05, 1], // Rotación Y proyectada en 2D
                    opacity: [0.75, 1.0, 0.75, 0.35, 0.75], // Destello al apuntar al frente
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                    <defs>
                      <radialGradient id="doubleBeamGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                        <stop offset="20%" stopColor="#ff4444" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#ef4444" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Triángulo Izquierdo */}
                    <polygon points="150,50 15,10 15,90" fill="url(#doubleBeamGrad)" />
                    {/* Triángulo Derecho */}
                    <polygon points="150,50 285,10 285,90" fill="url(#doubleBeamGrad)" />
                  </svg>
                </motion.div>

                {/* Destello de lente blanco-amarillo en el centro cuando la luz apunta hacia el frente */}
                <motion.div
                  className="absolute w-[200px] h-[200px] bg-[radial-gradient(circle,#ffffff_0%,#fef08a_20%,#ef4444_50%,transparent_70%)] pointer-events-none blur-md z-0"
                  animate={{
                    scale: [0.8, 1.5, 0.8, 0.5, 0.8],
                    opacity: [0.3, 1.0, 0.3, 0.05, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <SirenVector className="w-32 h-36 drop-shadow-[0_12px_35px_rgba(0,0,0,0.65)] relative z-10" />
              </div>

              {/* Centro: Texto y Botón (Siempre visible) */}
              <div className="text-center">
                <span className="text-red-100/90 font-extrabold text-xs tracking-[0.3em] uppercase block mb-3">
                  Atención Inmediata
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-wider text-shadow">
                  ¡EMERGENCIA 24/7!
                </h2>
                <p className="text-lg sm:text-xl text-red-100 font-semibold mb-8 max-w-xl mx-auto leading-relaxed">
                  ¿Inundaciones, goteras graves o drenajes tapados? Llegamos en menos de <strong className="text-white">30 minutos</strong> a todo <strong className="text-white">Puerto Rico</strong>.
                </p>
                <a 
                  href="tel:+17879001404" 
                  className="inline-flex items-center gap-3 bg-white text-red-600 hover:scale-105 active:scale-95 font-extrabold text-lg px-8 py-4 rounded-xl shadow-2xl transition-all"
                >
                  <Phone className="w-5 h-5 fill-red-600 text-red-600" /> Llama Ahora: (787) 900-1404
                </a>
              </div>

              {/* Lado Derecho: Celular Tipo iPhone 15 Pro Mockup Vibrando */}
              <div className="hidden md:flex justify-center relative items-center">
                <CallScreenIPhone scale={0.25} />
              </div>

            </div>
          </div>
        </section>

        {/* SECCIÓN 4: ABOUT & TRUST */}
        <section id="about" className="py-24 sm:py-32 bg-zinc-900/20 text-zinc-100 border-t border-zinc-900 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Lado Izquierdo: Fotografía */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-500/10 rounded-2xl z-0" />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-zinc-900 rounded-2xl z-0" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10 border border-zinc-900 aspect-[4/3] bg-zinc-900">
                  <img 
                    src="/plumbers_team.jpg" 
                    alt="Equipo Oficial de Los Plomeros" 
                    className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.02]" 
                  />
                </div>
              </div>

              {/* Lado Derecho: Contenido */}
              <div>
                <span className="text-red-500 font-extrabold text-xs tracking-[0.3em] uppercase block mb-2">
                  Sobre Nosotros
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
                  Comprometidos con la <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 font-black">Excelencia</span>
                </h2>
                <p className="text-zinc-400 text-lg mt-6 leading-relaxed font-medium">
                  Nos enorgullece brindar un servicio de plomería veloz, honesto y transparente. Cada integrante de nuestro equipo de técnicos está plenamente licenciado, asegurado y equipado con tecnología avanzada de diagnóstico.
                </p>

                {/* Lista de confianza */}
                <div className="mt-8 flex flex-col gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 flex-shrink-0 shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">Técnicos Licenciados y Certificados</h4>
                      <p className="text-zinc-400 text-sm mt-1">Garantía de conocimiento avanzado y verificación de antecedentes.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 flex-shrink-0 shadow-inner">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">Seguro de Cobertura Total</h4>
                      <p className="text-zinc-400 text-sm mt-1">Protección completa para tu hogar o negocio frente a imprevistos.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 flex-shrink-0 shadow-inner">
                      <ThumbsUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-base">Satisfacción 100% Garantizada</h4>
                      <p className="text-zinc-400 text-sm mt-1">Si el problema persiste tras nuestra visita, lo solucionamos sin cargos adicionales.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Módulo de Testimonios */}
            <div className="mt-24 pt-16 border-t border-zinc-900">
              <h3 className="text-2xl sm:text-3xl font-black text-white text-center mb-12">
                Lo que dicen nuestros clientes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Reseña 1 */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 hover:bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
                  <p className="text-zinc-300 italic text-base leading-relaxed">
                    "Se rompió la tubería principal de mi patio trasero de madrugada. Llegaron en solo 20 minutos con todo el equipo necesario y controlaron la fuga velozmente. ¡Súper limpios!"
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                      alt="Cliente Sofía Martínez" 
                      className="w-12 h-12 rounded-full object-cover border border-zinc-800" 
                    />
                    <div>
                      <h5 className="font-extrabold text-white text-sm">Sofía Martínez</h5>
                      <span className="text-amber-500 text-xs font-semibold">★★★★★</span>
                    </div>
                  </div>
                </div>

                {/* Reseña 2 */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 hover:bg-zinc-900/60 transition-all duration-300 backdrop-blur-sm flex flex-col justify-between">
                  <p className="text-zinc-300 italic text-base leading-relaxed">
                    "Tenía problemas recurrentes con la cañería de la cocina. En Los Plomeros usaron un sistema de hidrolavado a alta presión y el drenaje quedó perfecto. Son transparentes en la tarifa."
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                      alt="Cliente Carlos Mendoza" 
                      className="w-12 h-12 rounded-full object-cover border border-zinc-800" 
                    />
                    <div>
                      <h5 className="font-extrabold text-white text-sm">Carlos Mendoza</h5>
                      <span className="text-amber-500 text-xs font-semibold">★★★★★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 5: CONTACT & MAP */}
        <section id="contact" className="py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900">
          <div className="container mx-auto px-4">
            <div className="mb-16">
              <span className="text-red-500 font-extrabold text-xs tracking-[0.3em] uppercase block mb-2">
                Solicita un Técnico
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight leading-tight">
                Contacto & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">Ubicación</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              {/* Formulario */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 sm:p-10 backdrop-blur-sm">
                <form 
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Solicitud recibida. Nos comunicaremos contigo en menos de 5 minutos.");
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nombre</label>
                      <input 
                        type="text" 
                        id="name" 
                        placeholder="Ej. Juan Pérez" 
                        required 
                        className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Teléfono</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        placeholder="Ej. (555) 000-0000" 
                        required 
                        className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mensaje / Detalle de la avería</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      placeholder="Describe qué problema de plomería tienes en este momento..." 
                      required 
                      className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 rounded-xl text-base shadow-lg shadow-red-900/20">
                    Enviar Solicitud Inmediata
                  </Button>
                </form>
              </div>

              {/* Mapa de Cobertura */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 flex flex-col justify-between backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Área de Cobertura</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Atendemos llamadas y emergencias en todo Puerto Rico.
                  </p>
                </div>
                
                <div className="flex-grow h-[280px] rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d946843.4883395982!2d-66.86248486523436!3d18.22083299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c02b5b57a605f83%3A0x6b6c23067df924e5!2sPuerto%20Rico!5e0!3m2!1ses-419!2s!4v1700000000000!5m2!1ses-419!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Los <span className="text-red-500">PLOMEROS</span>
              </span>
              <p className="text-zinc-400 text-sm mt-4 leading-relaxed max-w-sm">
                Plomería profesional de urgencia a domicilio. Equipos especializados disponibles las 24 horas del día, los 7 días de la semana.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#home" onClick={(e) => handleNavClick(e, "home")} className="text-zinc-400 hover:text-white text-sm transition-colors">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={(e) => handleNavClick(e, "services")} className="text-zinc-400 hover:text-white text-sm transition-colors">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="text-zinc-400 hover:text-white text-sm transition-colors">
                    Nosotros
                  </a>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => handleNavClick(e, "contact")} className="text-zinc-400 hover:text-white text-sm transition-colors">
                    Contacto & Ubicación
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-6">Contacto Directo</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-zinc-400 text-sm">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Puerto Rico</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <a href="tel:+17879001404" className="hover:text-white transition-colors font-semibold">
                    (787) 900-1404 (24 Horas)
                  </a>
                </li>
                <li className="flex items-center gap-3 text-zinc-400 text-sm">
                  <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>info@losplomeros.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-zinc-900 pt-8 text-center">
            <p className="text-zinc-600 text-xs">
              &copy; {new Date().getFullYear()} Los Plomeros. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
      </motion.div>
    </>
  );
}

export default App;

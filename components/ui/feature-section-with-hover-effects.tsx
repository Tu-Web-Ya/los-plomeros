import { cn } from "../../lib/utils";
import {
  IconDroplet,
  IconFlame,
  IconSearch,
  IconCylinder,
  IconHammer,
  IconCertificate,
  IconGitBranch,
  IconAlarm,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Destape de Cañerías",
      description:
        "Limpieza profunda y remoción de obstrucciones difíciles mediante sistemas de lavado a alta presión.",
      icon: <IconDroplet className="w-8 h-8 text-red-500/90" />,
    },
    {
      title: "Calentadores de Agua",
      description:
        "Instalación, mantenimiento y reparación experta de calentadores de línea, solares y de tanque.",
      icon: <IconFlame className="w-8 h-8 text-amber-500/90" />,
    },
    {
      title: "Detección de Filtraciones",
      description:
        "Localización acústica y escaneo térmico de fugas ocultas sin romper paredes ni pisos.",
      icon: <IconSearch className="w-8 h-8 text-red-500/90" />,
    },
    {
      title: "Sistemas de Cisternas",
      description:
        "Instalación y reparación de cisternas residenciales y comerciales con bombas de presión avanzadas.",
      icon: <IconCylinder className="w-8 h-8 text-amber-500/90" />,
    },
    {
      title: "Remodelaciones de Tuberías",
      description:
        "Reemplazo y actualización completa de sistemas de distribución de agua en cobre y PEX para cocinas y baños.",
      icon: <IconHammer className="w-8 h-8 text-red-500/90" />,
    },
    {
      title: "Certificaciones Oficiales",
      description:
        "Inspección y firma de certificaciones de plomería requeridas por la AAA y agencias gubernamentales.",
      icon: <IconCertificate className="w-8 h-8 text-amber-500/90" />,
    },
    {
      title: "Tuberías y Acometidas",
      description:
        "Reparación y reemplazo de líneas principales, acometidas de agua, grifería y llaves de paso generales.",
      icon: <IconGitBranch className="w-8 h-8 text-red-500/90" />,
    },
    {
      title: "Plomería de Emergencia",
      description:
        "Atención inmediata de urgencias, inundaciones y tuberías rotas las 24 horas en todo Puerto Rico.",
      icon: <IconAlarm className="w-8 h-8 text-amber-500/90" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-12 max-w-7xl mx-auto border border-zinc-900/50 rounded-xl bg-zinc-950/20 backdrop-blur-sm overflow-hidden">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-12 relative group/feature border-zinc-900/50",
        (index === 0 || index === 4) && "lg:border-l border-zinc-900/50",
        index < 4 && "lg:border-b border-zinc-900/50"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-[3px] rounded-tr-full rounded-br-full bg-zinc-800 group-hover/feature:bg-red-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-zinc-100 group-hover/feature:text-white">
          {title}
        </span>
      </div>
      <p className="text-sm text-zinc-400 max-w-xs relative z-10 px-10 leading-relaxed group-hover/feature:text-zinc-300 transition duration-200">
        {description}
      </p>
    </div>
  );
};

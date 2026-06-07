import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function Hero() {
  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden bg-[#5D4037]">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
          alt="Spa Luxury"
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5D4037]/90 via-[#5D4037]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037] via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-12">
              <span className="h-[1px] w-12 bg-[#E5D3B3] block" />
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 leading-[0.9] tracking-tighter">
              El arte de <br />
              <span className="text-[#E5D3B3] italic font-light">consentirte</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/70 mb-12 max-w-xl font-light leading-relaxed">
              Descubre un refugio de serenidad donde la belleza y el bienestar se encuentran. Tratamientos exclusivos diseñados para renovar tu cuerpo y alma.
            </motion.p>

            <motion.div variants={itemVariants}>
              <a
                href="#reservas"
                className="inline-flex items-center justify-center bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full px-10 h-16 text-xs uppercase tracking-[0.3em] font-bold shadow-2xl transition-all hover:scale-105"
              >
                Reservar Ahora
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 2 }}
        className="absolute bottom-12 right-12 hidden lg:flex items-center gap-4 text-white/20"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] [writing-mode:vertical-rl] rotate-180">Marobel 2026</span>
        <div className="h-24 w-[1px] bg-white/20" />
      </motion.div>
    </section>
  );
}

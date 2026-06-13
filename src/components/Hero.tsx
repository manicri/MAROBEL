import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const heroImage = "https://files.catbox.moe/svgrgy.jpeg";

export default function Hero() {
  return (
    <section id="inicio" className="relative mt-[64px] flex min-h-[calc(100svh-64px)] items-center overflow-hidden bg-[#3b2923] md:mt-[66px] md:min-h-[calc(100vh-66px)]">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
        />
        <img
          src={heroImage}
          alt="Marobel Beauty Studio"
          className="relative h-full w-full object-cover object-[62%_center] opacity-65 md:object-contain md:object-center md:opacity-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b2923]/95 via-[#5D4037]/58 to-[#5D4037]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3b2923]/65 via-transparent to-transparent" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="container relative z-10 mx-auto px-5 py-16 sm:px-6">
        <div className="max-w-3xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5D3B3] backdrop-blur"><MapPin className="h-3.5 w-3.5" />Guayaquil</span>
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">Tu momento de <span className="italic text-[#E5D3B3]">belleza y bienestar</span></h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/72 md:text-base">Elige tus servicios, revisa precios y agenda en pocos pasos. Una experiencia cuidada desde la reserva hasta tu visita.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/servicios" className="inline-flex h-12 items-center justify-center rounded-full bg-[#E5D3B3] px-7 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">Reservar cita <ArrowRight className="ml-2 h-4 w-4" /></Link>
            <a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/8 px-7 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-white/15">Consultar por WhatsApp</a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

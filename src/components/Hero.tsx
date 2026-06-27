import { motion } from "motion/react";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const heroImage = "https://files.catbox.moe/svgrgy.jpeg";

export default function Hero() {
  return (
    <section id="inicio" className="relative mt-[64px] overflow-hidden bg-[#2f211d] md:mt-[66px]">
      <div className="relative min-h-[calc(100svh-64px)] overflow-hidden md:min-h-[calc(100svh-66px)]">
        <img
          src={heroImage}
          alt="Marobel Beauty Studio"
          width="1536"
          height="1024"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] md:object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f1512]/70 via-[#2f211d]/20 to-[#2f211d]/90 md:bg-gradient-to-r md:from-[#211713]/92 md:via-[#5D4037]/48 md:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(229,211,179,0.18),transparent_32%),linear-gradient(180deg,transparent_60%,rgba(47,33,29,0.92))]" />

        <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-64px)] items-end px-5 pb-8 pt-16 sm:px-6 md:min-h-[calc(100svh-66px)] md:items-center md:pb-14 md:pt-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl rounded-[2rem] border border-white/14 bg-[#2f211d]/68 p-5 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-7 md:max-w-3xl md:bg-[#2f211d]/58 md:p-9">
            <HeroContent />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E5D3B3]/30 bg-[#E5D3B3]/12 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5D3B3]"><Sparkles className="h-3.5 w-3.5" />Marobel Beauty Studio</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-white/78"><MapPin className="h-3.5 w-3.5" />Guayaquil</span>
      </div>
      <h1 className="max-w-3xl font-serif text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl">Belleza premium, <span className="italic text-[#E5D3B3]">cuidado personalizado</span></h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/78 md:mt-6 md:text-base">Agenda tu experiencia en un espacio diseñado para resaltar tu estilo, cuidar cada detalle y hacer que tu visita se sienta especial desde el primer momento.</p>
      <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row md:mt-8">
        <Link to="/servicios" className="inline-flex h-12 items-center justify-center rounded-full bg-[#E5D3B3] px-7 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">Reservar ahora <ArrowRight className="ml-2 h-4 w-4" /></Link>
        <a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-white/22 bg-white/8 px-7 text-center text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-white/15">WhatsApp</a>
      </div>
    </div>
  );
}

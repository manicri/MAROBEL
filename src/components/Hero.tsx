import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const heroImage = "https://files.catbox.moe/svgrgy.jpeg";

export default function Hero() {
  return (
    <section id="inicio" className="relative mt-[64px] overflow-hidden bg-[#3b2923] md:mt-[66px]">
      <div className="relative hidden min-h-[calc(100vh-66px)] bg-[#241916] md:block">
        <img
          src={heroImage}
          alt="Marobel Beauty Studio"
          width="1536"
          height="1024"
          className="absolute inset-0 h-full w-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f1512]/82 via-[#2f211d]/42 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f1512]/55 via-transparent to-[#1f1512]/10" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="container relative z-10 mx-auto flex min-h-[calc(100vh-66px)] items-center px-6 py-16 lg:px-10">
          <div className="max-w-xl rounded-[2rem] border border-white/15 bg-[#2f211d]/72 p-8 shadow-2xl shadow-black/25 backdrop-blur-md lg:p-10">
            <HeroContent />
          </div>
        </motion.div>
      </div>

      <div className="relative w-full bg-[#2f211d] md:hidden">
        <img
          src={heroImage}
          alt="Marobel Beauty Studio"
          width="1536"
          height="1024"
          className="block h-auto w-full"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#3b2923] to-transparent" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="container relative z-10 mx-auto -mt-1 px-5 pb-14 pt-5 sm:px-6 md:hidden">
        <HeroContent mobile />
      </motion.div>
    </section>
  );
}

function HeroContent({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="max-w-3xl">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#E5D3B3] backdrop-blur md:mb-5"><MapPin className="h-3.5 w-3.5" />Guayaquil</span>
      <h1 className={`${mobile ? "text-4xl sm:text-5xl" : "text-5xl lg:text-6xl xl:text-7xl"} max-w-3xl font-serif leading-[0.95] text-white`}>Tu momento de <span className="italic text-[#E5D3B3]">belleza y bienestar</span></h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 md:mt-6 md:text-base">Elige tus servicios, revisa precios y agenda en pocos pasos. Una experiencia cuidada desde la reserva hasta tu visita.</p>
      <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row md:mt-8">
        <Link to="/servicios" className="inline-flex h-12 items-center justify-center rounded-full bg-[#E5D3B3] px-7 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">Reservar cita <ArrowRight className="ml-2 h-4 w-4" /></Link>
        <a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/8 px-7 text-center text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-white/15">Consultar por WhatsApp</a>
      </div>
    </div>
  );
}

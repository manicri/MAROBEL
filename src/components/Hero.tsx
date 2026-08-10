import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const heroImage = "https://files.catbox.moe/svgrgy.jpeg";

export default function Hero() {
  return (
    <section id="inicio" className="bg-[#f3ede5] px-4 pb-10 pt-24 sm:px-6 md:pb-16 md:pt-28">
      <div className="mx-auto grid max-w-7xl items-stretch gap-0 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 flex min-h-[510px] flex-col justify-between bg-[#3d302b] px-7 py-9 text-[#fdfbf7] sm:px-10 sm:py-12 lg:-mr-10 lg:min-h-[590px] lg:px-14 lg:py-14">
          <div>
            <span className="marobel-kicker text-[#e8d8bd]">Beauty studio · Guayaquil</span>
            <div className="mt-8 flex items-center gap-3 text-xs text-white/65"><MapPin className="h-4 w-4 text-[#e8d8bd]" /> La Alborada, Guayaquil</div>
            <h1 className="mt-6 max-w-xl text-5xl leading-[0.9] sm:text-6xl lg:text-7xl">Belleza que se siente <em className="text-[#e8d8bd]">bien</em>.</h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/70 sm:text-base">Un espacio para cuidar tus manos, tu piel y tu tiempo. Elige tu servicio, consulta disponibilidad y llega a tu cita con todo claro.</p>
          </div>
          <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Link to="/servicios" className="inline-flex items-center gap-3 border border-[#e8d8bd] bg-[#e8d8bd] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3d302b] transition hover:bg-white hover:border-white">Explorar servicios <ArrowUpRight className="h-4 w-4" /></Link>
            <a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 underline decoration-[#e8d8bd]/60 underline-offset-8 transition hover:text-white">Consultar disponibilidad</a>
          </div>
        </div>

        <div className="relative min-h-[350px] overflow-hidden bg-[#d9cabb] lg:min-h-[590px]">
          <img src={heroImage} alt="Interior y experiencia de Marobel Beauty Studio" className="h-full min-h-[350px] w-full object-cover lg:min-h-[590px]" referrerPolicy="no-referrer" />
          <div className="absolute bottom-0 left-0 bg-[#fdfbf7] px-5 py-4 sm:px-7"><p className="font-serif text-2xl text-[#3d302b]">Marobel</p><p className="marobel-kicker mt-1">Cuidado · calma · detalle</p></div>
        </div>
      </div>
    </section>
  );
}

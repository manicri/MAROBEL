import { motion } from "motion/react";
import { BadgeCheck, CalendarCheck2, UserRoundCheck } from "lucide-react";

const points = [
  { icon: UserRoundCheck, title: "Atención personalizada", text: "Cada reserva se adapta al servicio, tiempo y cuidado que necesitas." },
  { icon: BadgeCheck, title: "Productos seleccionados", text: "Trabajamos con insumos profesionales y protocolos de higiene." },
  { icon: CalendarCheck2, title: "Agenda organizada", text: "Horarios claros, bloqueos actualizados y confirmación antes de tu visita." },
];

export default function About() {
  return (
    <section id="nosotros" className="overflow-hidden bg-[#FAF9F6] px-5 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop" alt="Interior Marobel" className="h-[360px] w-full rounded-[2rem] object-cover shadow-xl md:h-[460px]" referrerPolicy="no-referrer" />
            <div className="absolute bottom-4 left-4 rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur"><p className="font-serif text-3xl text-[#5D4037]">+100</p><p className="text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/55">clientas atendidas</p></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-7">
            <div>
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]">Nuestra esencia</span>
              <h2 className="font-serif text-3xl leading-tight text-[#5D4037] md:text-5xl">Belleza cuidada, agenda clara y una experiencia tranquila.</h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5D4037]/65 md:text-base">Marobel reúne servicios de belleza y bienestar en un espacio pensado para que puedas elegir, reservar y llegar con confianza.</p>
            </div>
            <div className="grid gap-3">
              {points.map(({ icon: Icon, title, text }) => <div key={title} className="group flex gap-4 rounded-2xl border border-[#E5D3B3]/30 bg-white p-4 shadow-sm transition-colors hover:border-[#8D6E63]/35"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#8D6E63]/20 bg-[#FAF9F6] text-[#5D4037]"><Icon className="h-[18px] w-[18px]" strokeWidth={1.6} /></div><div><h3 className="text-sm font-bold text-[#5D4037]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-[#5D4037]/58">{text}</p></div></div>)}
            </div>
            <div className="rounded-3xl bg-[#5D4037] p-6 text-white"><p className="text-sm italic leading-relaxed text-white/75">“Queremos que cada visita se sienta organizada, cálida y hecha a tu medida.”</p><p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#E5D3B3]">Equipo Marobel</p></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

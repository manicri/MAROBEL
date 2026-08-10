import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Clock, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";

interface Service { id: string; nombre: string; descripcion?: string; categoria?: string; precio: number; duracion?: string; imagen_url?: string; }

const faqs = [
  { question: "¿Cómo reservo?", answer: "Elige tus servicios, revisa el horario disponible y envía tu solicitud. Te confirmaremos la cita por WhatsApp." },
  { question: "¿Puedo cambiar mi cita?", answer: "Sí. Escríbenos con anticipación y revisaremos contigo las opciones disponibles." },
  { question: "¿Dónde estamos?", answer: "Estamos en La Alborada, Guayaquil. Abre el mapa del pie de página para consultar la ubicación exacta." },
];

export default function HomeExperience() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("servicios").select("id, nombre, descripcion, categoria, precio, duracion, imagen_url").order("created_at", { ascending: false }).limit(3);
      setServices(data ?? []);
    };
    load();
  }, []);

  return <section className="bg-[#fdfbf7] px-5 py-20 sm:px-6 md:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 flex flex-col justify-between gap-6 border-b border-[#d9cabb] pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl"><span className="marobel-kicker">Una selección para empezar</span><h2 className="mt-4 text-4xl leading-[0.95] text-[#3d302b] md:text-6xl">Tu tiempo merece un <em className="text-[#98735f]">buen ritual.</em></h2><p className="mt-5 max-w-xl text-sm leading-7 text-[#76685f] md:text-base">Desde una manicura precisa hasta un momento de pausa para tu piel. En Marobel, cada servicio se agenda con claridad y se disfruta sin prisa.</p></div>
        <Link to="/servicios" className="inline-flex items-center gap-3 self-start text-[10px] font-bold uppercase tracking-[0.22em] text-[#3d302b] underline decoration-[#c58d72] underline-offset-8 transition hover:text-[#98735f] md:self-end">Ver catálogo completo <ArrowUpRight className="h-4 w-4" /></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {services.length ? services.map((service, index) => <article key={service.id} className={`group relative overflow-hidden bg-[#e9ded2] ${index === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5"}`}>
          <div className={`${index === 0 ? "h-[390px] md:h-[560px]" : "h-64"} relative`}>
            {service.imagen_url ? <img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="h-full w-full bg-[#d9cabb]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d231f]/75 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8"><span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#e8d8bd]">{service.categoria || "Belleza"}</span><h3 className={`${index === 0 ? "text-4xl md:text-5xl" : "text-3xl"} mt-2 leading-none`}>{service.nombre}</h3><p className="mt-3 max-w-md text-xs leading-6 text-white/75">{service.descripcion || "Atención profesional adaptada a ti."}</p><Link to={`/servicios?categoria=${encodeURIComponent(service.categoria || "")}`} className="mt-5 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white underline decoration-[#e8d8bd] underline-offset-8">Consultar servicio <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
          </div>
        </article>) : [1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse bg-[#f1ebe2] md:col-span-4" />)}

        <div className="flex flex-col justify-between bg-[#e8d8bd] p-7 text-[#3d302b] md:col-span-5"><div><span className="marobel-kicker text-[#6d5748]">Antes de tu visita</span><h3 className="mt-4 text-3xl leading-none">Todo claro desde el primer mensaje.</h3><p className="mt-4 text-sm leading-6 text-[#3d302b]/70">Consulta horarios, duración y disponibilidad real antes de reservar.</p></div><a href="https://wa.me/593969272530" target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center gap-3 self-start border-b border-[#3d302b] pb-2 text-[10px] font-bold uppercase tracking-[0.2em]"><MessageCircle className="h-4 w-4" />Consultar por WhatsApp</a></div>
        <div className="grid gap-4 bg-[#3d302b] p-7 text-[#fdfbf7] sm:grid-cols-2 md:col-span-5"><div><span className="marobel-kicker text-[#e8d8bd]">Marobel, Guayaquil</span><h3 className="mt-4 text-3xl leading-none">Una agenda hecha para respirar.</h3></div><div className="space-y-4 self-end text-xs leading-5 text-white/70"><div className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-[#e8d8bd]" />La Alborada, Guayaquil</div><div className="flex gap-3"><Clock className="h-4 w-4 shrink-0 text-[#e8d8bd]" />Lunes a sábado · 9:00–18:00</div></div></div>
      </div>

      <div className="mt-20 grid gap-10 border-t border-[#d9cabb] pt-10 lg:grid-cols-[0.7fr_1.3fr]"><div><span className="marobel-kicker">Resolvemos lo esencial</span><h2 className="mt-4 text-4xl leading-none text-[#3d302b]">Preguntas frecuentes</h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#76685f]">Si necesitas algo más específico, escríbenos directamente.</p></div><div className="divide-y divide-[#d9cabb]">{faqs.map((faq) => <details key={faq.question} className="group py-5 first:pt-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#3d302b]"><span>{faq.question}</span><span className="text-[#98735f] transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[#76685f]">{faq.answer}</p></details>)}</div></div>
      <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#d9cabb] pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#76685f]"><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#98735f]" /> Atención personalizada</span><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#98735f]" /> Protocolos de higiene</span><span className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#98735f]" /> Confirmación directa</span></div>
    </div>
  </section>;
}

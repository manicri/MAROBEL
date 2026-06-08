import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, HelpCircle, MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "../supabase";

interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  duracion?: string;
  imagen_url?: string;
}

const faqs = [
  { question: "¿Cómo reservo?", answer: "Elige uno o varios servicios, selecciona un horario disponible y envía tu solicitud. Marobel confirmará la cita." },
  { question: "¿Puedo cambiar mi cita?", answer: "Sí. Escríbenos por WhatsApp con anticipación para ayudarte a moverla según disponibilidad." },
  { question: "¿Dónde encontrarnos?", answer: "Atendemos en Guayaquil. Puedes abrir la ubicación exacta desde el mapa y los enlaces del pie de página." },
];

export default function HomeExperience() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("servicios")
        .select("id, nombre, descripcion, categoria, precio, duracion, imagen_url")
        .order("created_at", { ascending: false })
        .limit(3);
      setServices(data ?? []);
    };
    load();
  }, []);

  return (
    <section className="bg-[#FAF9F6] px-5 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]">Elige tu experiencia</span>
            <h2 className="font-serif text-3xl leading-tight text-[#5D4037] md:text-5xl">Servicios destacados</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5D4037]/65">Una selección breve para comenzar. En el catálogo encontrarás todos los tratamientos, precios y horarios.</p>
          </div>
          <Link to="/servicios" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]">Ver catálogo completo <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {services.length ? services.map((service) => (
            <article key={service.id} className="overflow-hidden rounded-3xl border border-[#E5D3B3]/30 bg-white shadow-sm">
              <div className="h-44 bg-[#E5D3B3]/20">
                {service.imagen_url ? <img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Sparkles className="h-9 w-9 text-[#8D6E63]/35" /></div>}
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-3"><h3 className="font-serif text-xl text-[#5D4037]">{service.nombre}</h3><span className="font-bold text-[#8D6E63]">${Number(service.precio || 0).toFixed(2)}</span></div>
                <p className="mb-4 line-clamp-2 min-h-10 text-xs leading-relaxed text-[#5D4037]/60">{service.descripcion || "Atención profesional adaptada a tus necesidades."}</p>
                <div className="mb-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/45"><span>{service.categoria || "Belleza"}</span>{service.duracion && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{service.duracion}</span>}</div>
                <Link to={`/servicios?categoria=${encodeURIComponent(service.categoria || "")}`} className="block rounded-full bg-[#5D4037] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-widest text-white">Ver y reservar</Link>
              </div>
            </article>
          )) : [1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-white" />)}
        </div>

        <div className="mt-12 grid gap-4 rounded-3xl bg-[#5D4037] p-5 text-white md:grid-cols-3 md:p-7">
          {[{ icon: ShieldCheck, title: "Atención profesional", text: "Protocolos claros y servicios personalizados." }, { icon: MessageCircle, title: "Confirmación directa", text: "Recibe el estado de tu reserva por WhatsApp." }, { icon: MapPin, title: "Ubicación accesible", text: "Consulta el mapa y llega fácilmente al local." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3 rounded-2xl bg-white/8 p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#E5D3B3]" /><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-white/65">{text}</p></div></div>)}
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-[0.7fr_1.3fr]">
          <div><span className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]"><HelpCircle className="h-4 w-4" />Antes de reservar</span><h2 className="font-serif text-3xl text-[#5D4037]">Preguntas frecuentes</h2><p className="mt-3 text-sm leading-relaxed text-[#5D4037]/60">Lo esencial para que reserves con tranquilidad.</p></div>
          <div className="grid gap-3">{faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-[#E5D3B3]/30 bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#5D4037]"><span>{faq.question}</span><CheckCircle2 className="h-4 w-4 text-[#8D6E63]" /></summary><p className="pt-3 text-xs leading-relaxed text-[#5D4037]/60">{faq.answer}</p></details>)}</div>
        </div>
      </div>
    </section>
  );
}

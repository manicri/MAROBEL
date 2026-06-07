import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Search, Sparkles } from "lucide-react";
import { supabase } from "../supabase";
import { useSelection } from "../context/SelectionContext";
import { cn } from "../lib/utils";

interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  duracion?: string;
  imagen_url?: string;
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedServices, addService, removeService } = useSelection();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("servicios")
        .select("id, nombre, descripcion, categoria, precio, duracion, imagen_url")
        .order("categoria")
        .order("nombre");

      if (fetchError) {
        console.error(fetchError);
        setError("No pudimos cargar los servicios. Intenta nuevamente.");
      } else {
        setServices(data ?? []);
        setError("");
      }
      setLoading(false);
    };

    fetchServices();
    const channel = supabase.channel("catalogo_servicios").on("postgres_changes", { event: "*", schema: "public", table: "servicios" }, fetchServices).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoria") || "Todos");
  }, [searchParams]);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(services.map((service) => service.categoria).filter(Boolean) as string[]))],
    [services]
  );

  const filteredServices = useMemo(() => {
    const value = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "Todos" || service.categoria === selectedCategory;
      const matchesSearch = !value || service.nombre.toLowerCase().includes(value) || service.descripcion?.toLowerCase().includes(value) || service.categoria?.toLowerCase().includes(value);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, services]);

  const toggleService = (service: Service) => {
    if (selectedServices.some((selected) => selected.id === service.id)) {
      removeService(service.id);
      return;
    }
    addService({ id: service.id, name: service.nombre, price: Number(service.precio || 0), category: service.categoria || "Servicio", description: service.descripcion, duration: service.duracion });
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-20 pt-24">
      <section className="border-b border-[#E5D3B3]/30 bg-[#5D4037] px-5 py-10 text-white md:py-12">
        <div className="container mx-auto max-w-7xl">
          <span className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5D3B3]"><Sparkles className="h-4 w-4" />Catalogo completo</span>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="mb-4 max-w-4xl font-serif text-3xl leading-tight md:text-5xl">Todos nuestros servicios</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">Revisa cada tratamiento, su duracion y precio. Selecciona varios servicios y reservalos juntos.</p>
            </div>
            {selectedServices.length > 0 && (
              <Link to="/reserva" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5D3B3] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">
                Reservar {selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""}<ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-8 rounded-2xl border border-[#E5D3B3]/30 bg-white p-4 shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D6E63]" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar servicio..." className="h-11 w-full rounded-xl bg-[#FAF9F6] pl-11 pr-4 text-sm text-[#5D4037] outline-none ring-[#8D6E63]/30 transition focus:ring-2" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSearchParams(category === "Todos" ? {} : { categoria: category })} className={cn("shrink-0 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest transition", selectedCategory === category ? "bg-[#5D4037] text-white" : "border border-[#E5D3B3] text-[#5D4037] hover:border-[#5D4037]")}>{category}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60">Cargando servicios...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 py-16 text-center text-red-600">{error}</div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60">No encontramos servicios con esos filtros.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const isSelected = selectedServices.some((selected) => selected.id === service.id);
              return (
                <article key={service.id} className={cn("overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg", isSelected ? "border-[#5D4037] ring-2 ring-[#5D4037]/10" : "border-[#E5D3B3]/30")}>
                  <div className="relative h-40 bg-[#E5D3B3]/20 sm:h-44">
                    {service.imagen_url ? <img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <div className="flex h-full items-center justify-center"><Sparkles className="h-9 w-9 text-[#8D6E63]/35" /></div>}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest text-[#5D4037] backdrop-blur">{service.categoria || "Servicio"}</span>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h2 className="font-serif text-xl leading-tight text-[#5D4037]">{service.nombre}</h2>
                      <span className="whitespace-nowrap text-base font-bold text-[#8D6E63]">${Number(service.precio || 0).toFixed(2)}</span>
                    </div>
                    {service.duracion && <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/50"><Clock className="h-3.5 w-3.5" />{service.duracion}</p>}
                    <p className="mb-4 line-clamp-3 min-h-[42px] text-xs leading-relaxed text-[#5D4037]/65">{service.descripcion || "Tratamiento profesional personalizado segun tus necesidades."}</p>
                    <button type="button" onClick={() => toggleService(service)} className={cn("w-full rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition", isSelected ? "bg-[#E5D3B3] text-[#5D4037] hover:bg-[#dcc69f]" : "bg-[#5D4037] text-white hover:bg-[#4a332c]")}>{isSelected ? "Quitar de la reserva" : "Agregar a mi reserva"}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

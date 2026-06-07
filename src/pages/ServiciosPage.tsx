import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
    const channel = supabase
      .channel("catalogo_servicios")
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios" }, fetchServices)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(services.map((service) => service.categoria).filter(Boolean) as string[]))],
    [services]
  );

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "Todos" || service.categoria === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        service.nombre.toLowerCase().includes(normalizedSearch) ||
        service.descripcion?.toLowerCase().includes(normalizedSearch) ||
        service.categoria?.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, services]);

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((selected) => selected.id === service.id);
    if (isSelected) {
      removeService(service.id);
      return;
    }

    addService({
      id: service.id,
      name: service.nombre,
      price: Number(service.precio || 0),
      category: service.categoria || "Servicio",
      description: service.descripcion,
      duration: service.duracion,
    });
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24 pt-28">
      <section className="border-b border-[#E5D3B3]/30 bg-[#5D4037] px-6 py-16 text-white">
        <div className="container mx-auto max-w-7xl">
          <span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-[#E5D3B3]">
            <Sparkles className="h-4 w-4" />
            Catalogo completo
          </span>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="mb-5 max-w-4xl font-serif text-4xl leading-tight md:text-6xl">Todos nuestros servicios</h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/70">
                Revisa cada tratamiento, su duracion y precio. Puedes seleccionar varios servicios y reservarlos juntos.
              </p>
            </div>
            {selectedServices.length > 0 && (
              <Link to="/reserva" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5D3B3] px-7 py-4 text-xs font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">
                Reservar {selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 rounded-3xl border border-[#E5D3B3]/30 bg-white p-5 shadow-sm">
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8D6E63]" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, categoria o tratamiento..." className="h-13 w-full rounded-2xl bg-[#FAF9F6] pl-12 pr-4 text-sm text-[#5D4037] outline-none ring-[#8D6E63]/30 transition focus:ring-2" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={cn("shrink-0 rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition", selectedCategory === category ? "bg-[#5D4037] text-white" : "border border-[#E5D3B3] text-[#5D4037] hover:border-[#5D4037]")}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white py-20 text-center text-[#5D4037]/60">Cargando servicios...</div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 py-20 text-center text-red-600">{error}</div>
        ) : filteredServices.length === 0 ? (
          <div className="rounded-3xl bg-white py-20 text-center text-[#5D4037]/60">No encontramos servicios con esos filtros.</div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => {
              const isSelected = selectedServices.some((selected) => selected.id === service.id);
              return (
                <article key={service.id} className={cn("overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl", isSelected ? "border-[#5D4037] ring-2 ring-[#5D4037]/10" : "border-[#E5D3B3]/30")}>
                  <div className="relative h-64 bg-[#E5D3B3]/20">
                    {service.imagen_url ? (
                      <img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Sparkles className="h-12 w-12 text-[#8D6E63]/35" /></div>
                    )}
                    <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#5D4037] backdrop-blur">{service.categoria || "Servicio"}</span>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h2 className="font-serif text-2xl text-[#5D4037]">{service.nombre}</h2>
                      <span className="whitespace-nowrap text-xl font-bold text-[#8D6E63]">${Number(service.precio || 0).toFixed(2)}</span>
                    </div>
                    {service.duracion && <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5D4037]/50"><Clock className="h-4 w-4" />{service.duracion}</p>}
                    <p className="mb-6 min-h-[48px] text-sm leading-relaxed text-[#5D4037]/65">{service.descripcion || "Tratamiento profesional personalizado segun tus necesidades."}</p>
                    <button type="button" onClick={() => toggleService(service)} className={cn("w-full rounded-full px-6 py-4 text-xs font-bold uppercase tracking-widest transition", isSelected ? "bg-[#E5D3B3] text-[#5D4037] hover:bg-[#dcc69f]" : "bg-[#5D4037] text-white hover:bg-[#4a332c]")}>
                      {isSelected ? "Quitar de la reserva" : "Agregar a mi reserva"}
                    </button>
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

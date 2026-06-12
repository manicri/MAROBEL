import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Search, Sparkles, X } from "lucide-react";
import { supabase } from "../supabase";
import { useSelection } from "../context/SelectionContext";
import { cn } from "../lib/utils";

interface Service {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  precio_desde?: boolean;
  duracion?: string;
  imagen_url?: string;
}

const preferredCategoryOrder = [
  "Manicura y pedicura",
  "Cejas",
  "Pestañas",
  "Peluquería",
  "Cosmetología",
  "Maquillaje",
];

const sortCategories = (first: string, second: string) => {
  const firstIndex = preferredCategoryOrder.indexOf(first);
  const secondIndex = preferredCategoryOrder.indexOf(second);
  if (firstIndex === -1 && secondIndex === -1) return first.localeCompare(second, "es");
  if (firstIndex === -1) return 1;
  if (secondIndex === -1) return -1;
  return firstIndex - secondIndex;
};

const priceLabel = (service: Service) => `${service.precio_desde ? "Desde " : ""}$${Number(service.precio || 0).toFixed(2)}`;

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
        .select("*")
        .order("categoria")
        .order("nombre");

      if (fetchError) {
        console.error(fetchError);
        setError("No pudimos cargar los servicios. Intenta nuevamente.");
      } else {
        setServices((data as Service[]) ?? []);
        setError("");
      }
      setLoading(false);
    };

    fetchServices();
    const channel = supabase
      .channel("catalogo_servicios")
      .on("postgres_changes", { event: "*", schema: "public", table: "servicios" }, fetchServices)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => setSelectedCategory(searchParams.get("categoria") || "Todos"), [searchParams]);

  const categories = useMemo(() => [
    "Todos",
    ...Array.from(new Set(services.map((service) => service.categoria).filter(Boolean) as string[])).sort(sortCategories),
  ], [services]);

  const filteredServices = useMemo(() => {
    const value = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "Todos" || service.categoria === selectedCategory;
      const searchableText = `${service.nombre} ${service.descripcion || ""} ${service.categoria || ""}`.toLowerCase();
      return matchesCategory && (!value || searchableText.includes(value));
    });
  }, [search, selectedCategory, services]);

  const groupedServices = useMemo(() => {
    const groups = filteredServices.reduce((result, service) => {
      const category = service.categoria || "Otros servicios";
      if (!result[category]) result[category] = [];
      result[category].push(service);
      return result;
    }, {} as Record<string, Service[]>);

    return Object.entries(groups)
      .sort(([first], [second]) => sortCategories(first, second))
      .map(([category, items]) => ({ category, items: items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es")) }));
  }, [filteredServices]);

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  const toggleService = (service: Service) => {
    if (selectedServices.some((selected) => selected.id === service.id)) {
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

  return <main className="min-h-screen bg-[#FAF9F6] pb-24 pt-24">
    <section className="border-b border-[#E5D3B3]/30 bg-[#5D4037] px-5 py-10 text-white md:py-12">
      <div className="container mx-auto max-w-7xl">
        <span className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5D3B3]"><Sparkles className="h-4 w-4" />Catálogo completo</span>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><h1 className="mb-4 max-w-4xl font-serif text-3xl leading-tight md:text-5xl">Servicios Marobel</h1><p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">Explora cada especialidad, revisa sus detalles y combina todos los servicios que desees en una misma reserva.</p></div>
          {selectedServices.length > 0 && <Link to="/reserva" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5D3B3] px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] transition hover:bg-white">Reservar {selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""}<ArrowRight className="h-4 w-4" /></Link>}
        </div>
      </div>
    </section>

    <section className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
      <div className="mb-9 rounded-2xl border border-[#E5D3B3]/30 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D6E63]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar servicio..." className="h-11 w-full rounded-xl bg-[#FAF9F6] pl-11 pr-4 text-sm text-[#5D4037] outline-none ring-[#8D6E63]/30 transition focus:ring-2" /></div>
          {(search || selectedCategory !== "Todos") && <button type="button" onClick={clearFilters} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5D3B3] px-4 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]"><X className="h-4 w-4" />Limpiar</button>}
        </div>
        <div className="mb-3 flex items-center justify-between"><p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#5D4037]/45">Tipos de servicio</p><p className="text-xs text-[#8D6E63]">{filteredServices.length} opción{filteredServices.length === 1 ? "" : "es"}</p></div>
        <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category} type="button" onClick={() => setSearchParams(category === "Todos" ? {} : { categoria: category })} className={cn("shrink-0 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest transition", selectedCategory === category ? "bg-[#5D4037] text-white" : "border border-[#E5D3B3] text-[#5D4037] hover:border-[#5D4037]")}>{category}{category !== "Todos" && <span className="ml-2 opacity-60">{services.filter((service) => service.categoria === category).length}</span>}</button>)}</div>
      </div>

      {loading ? <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60">Cargando servicios...</div> : error ? <div className="rounded-2xl border border-red-100 bg-red-50 py-16 text-center text-red-600">{error}</div> : !filteredServices.length ? <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60"><p className="mb-4">No encontramos servicios con esos filtros.</p><button type="button" onClick={clearFilters} className="rounded-full bg-[#5D4037] px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white">Ver todos</button></div> : <div className="space-y-12">{groupedServices.map(({ category, items }) => <section key={category} aria-labelledby={`category-${category}`}>
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-[#E5D3B3]/40 pb-4"><div><span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8D6E63]">Especialidad Marobel</span><h2 id={`category-${category}`} className="mt-1 font-serif text-3xl text-[#5D4037] md:text-4xl">{category}</h2></div><span className="shrink-0 rounded-full bg-[#E5D3B3]/25 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]">{items.length} servicio{items.length === 1 ? "" : "s"}</span></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((service) => {
          const selected = selectedServices.some((item) => item.id === service.id);
          return <article key={service.id} className={cn("flex overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg", selected ? "border-[#5D4037] ring-2 ring-[#5D4037]/10" : "border-[#E5D3B3]/30")}>
            <div className="flex w-full flex-col">
              {service.imagen_url && <div className="h-40 bg-[#E5D3B3]/20"><img src={service.imagen_url} alt={service.nombre} className="h-full w-full object-cover" referrerPolicy="no-referrer" /></div>}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-3 flex items-start justify-between gap-3"><h3 className="font-serif text-xl leading-tight text-[#5D4037]">{service.nombre}</h3><span className="whitespace-nowrap text-sm font-bold text-[#8D6E63]">{priceLabel(service)}</span></div>
                {service.duracion && <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/50"><Clock className="h-3.5 w-3.5" />{service.duracion}</p>}
                <p className="mb-5 flex-1 text-xs leading-relaxed text-[#5D4037]/65">{service.descripcion || "Tratamiento profesional personalizado según tus necesidades."}</p>
                <button type="button" onClick={() => toggleService(service)} className={cn("w-full rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition", selected ? "bg-[#E5D3B3] text-[#5D4037]" : "bg-[#5D4037] text-white hover:bg-[#4a332c]")}>{selected ? "Quitar de la reserva" : "Agregar a mi reserva"}</button>
              </div>
            </div>
          </article>;
        })}</div>
      </section>)}</div>}
    </section>

    {selectedServices.length > 0 && <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#5D4037] p-3 text-white shadow-2xl md:hidden"><Link to="/reserva" className="flex items-center justify-between"><span className="text-xs font-bold">{selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""} seleccionado{selectedServices.length > 1 ? "s" : ""}</span><span className="rounded-full bg-[#E5D3B3] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]">Continuar</span></Link></div>}
  </main>;
}

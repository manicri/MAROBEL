import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Info, Search, Sparkles, X } from "lucide-react";
import { supabase } from "../supabase";
import { useSelection } from "../context/SelectionContext";
import { buildServiceCatalog, categoryOrder, type CatalogService } from "../data/serviceCatalog";
import { getServiceImage } from "../data/serviceImages";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const priceLabel = (service: CatalogService) =>
  `${service.precio_desde ? "Desde " : ""}$${Number(service.precio || 0).toFixed(2)}`;

const serviceImageFocus: Record<string, string> = {
  "Manicura con Rubber Base": "50% 58%",
  "Manicura técnica Soft Gel": "50% 62%",
  "Manicura en acrílico": "54% 57%",
  "Pedicura con gel de construcción": "50% 50%",
  Microshading: "50% 50%",
  "Efecto polvo": "50% 50%",
};

const serviceImageClass: Record<string, string> = {
  Microshading: "h-full w-full object-contain p-1",
  "Efecto polvo": "h-[172%] w-auto max-w-none object-contain",
};

const serviceImageTransform: Record<string, string> = {
  "Efecto polvo": "rotate(-90deg) scale(1.08)",
};

const noHoverZoom = new Set(["Microshading"]);
const OWNER_EMAIL = "crisdelrobbys@gmail.com";

export default function ServiciosPage() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [catalogWarning, setCatalogWarning] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedServices, addService, removeService } = useSelection();
  const { user } = useAuth();
  const [editingImageId, setEditingImageId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const canEditImages = false;
  const canEditImagesInline = user?.email?.trim().toLowerCase() === OWNER_EMAIL;
  const [cropWidth, setCropWidth] = useState(1200);
  const [cropHeight, setCropHeight] = useState(800);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase.from("servicios").select("*");
      if (fetchError) {
        console.error(fetchError);
        setServices(buildServiceCatalog([]));
        setCatalogWarning("La base de datos no está disponible. Mostrando el catálogo guardado localmente.");
        setError("");
      } else {
        setServices(buildServiceCatalog((data as Array<Record<string, unknown>>) ?? []));
        setError("");
        setCatalogWarning("");
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

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoria") || "Todos");
  }, [searchParams]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set([...categoryOrder, ...services.map((service) => service.categoria)]))], [services]);

  const filteredServices = useMemo(() => {
    const value = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "Todos" || service.categoria === selectedCategory;
      const searchableText = `${service.nombre} ${service.descripcion} ${service.categoria} ${service.seccion}`.toLowerCase();
      return matchesCategory && (!value || searchableText.includes(value));
    });
  }, [search, selectedCategory, services]);

  const groupedServices = useMemo(() => Array.from(new Set([...categoryOrder, ...services.map((service) => service.categoria)])).map((category) => {
    const categoryServices = filteredServices.filter((service) => service.categoria === category);
    const sectionNames = Array.from(new Set(categoryServices.map((service) => service.seccion)));
    return {
      category,
      count: categoryServices.length,
      sections: sectionNames.map((section) => ({
        section,
        items: categoryServices.filter((service) => service.seccion === section),
      })),
    };
  }).filter((group) => group.count > 0), [filteredServices]);

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  const toggleService = (service: CatalogService) => {
    if (selectedServices.some((selected) => selected.id === service.id)) {
      removeService(service.id);
      return;
    }
    addService({
      id: service.id,
      name: service.nombre,
      price: Number(service.precio || 0),
      category: service.categoria,
      description: service.descripcion,
      duration: service.duracion,
    });
  };

  const cropServiceImage = (file: File, width: number, height: number) => new Promise<File>((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = String(reader.result); };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    image.onload = () => {
      const targetRatio = width / height;
      const sourceRatio = image.width / image.height;
      let sourceWidth = image.width;
      let sourceHeight = image.height;
      let sourceX = 0;
      let sourceY = 0;
      if (sourceRatio > targetRatio) { sourceWidth = image.height * targetRatio; sourceX = (image.width - sourceWidth) / 2; }
      else { sourceHeight = image.width / targetRatio; sourceY = (image.height - sourceHeight) / 2; }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve(new File([blob], "servicio.webp", { type: "image/webp" })) : reject(new Error("No se pudo recortar la imagen")), "image/webp", 0.9);
    };
    image.onerror = () => reject(new Error("El archivo no es una imagen válida"));
    reader.readAsDataURL(file);
  });

  const handlePublicImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editingImageId) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecciona una imagen válida"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("La imagen no puede superar los 10 MB"); return; }
    setUploadingImage(true);
    try {
      const croppedFile = await cropServiceImage(file, Math.max(320, cropWidth), Math.max(240, cropHeight));
      const path = `${user?.id}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage.from("servicios-images").upload(path, croppedFile, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("servicios-images").getPublicUrl(path);
      const { error: updateError } = await supabase.from("servicios").update({ imagen_url: publicData.publicUrl }).eq("id", editingImageId);
      if (updateError) throw updateError;
      setServices((previous) => previous.map((service) => service.id === editingImageId ? { ...service, imagen_url: publicData.publicUrl } : service));
      toast.success("Imagen publicada correctamente");
    } catch (error: any) {
      toast.error(`No se pudo publicar la imagen: ${error?.message || "error desconocido"}`);
    } finally { setUploadingImage(false); setEditingImageId(""); }
  };

  return <main className="min-h-screen bg-[#FAF9F6] pb-24 pt-24">
    <section className="border-b border-[#E5D3B3]/30 bg-[#5D4037] px-5 py-10 text-white md:py-12">
      <div className="container mx-auto max-w-7xl">
        <span className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5D3B3]"><Sparkles className="h-4 w-4" />Catálogo completo</span>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><h1 className="mb-4 max-w-4xl font-serif text-3xl leading-tight md:text-5xl">Nuestros servicios</h1><p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">Explora cada especialidad en el orden de nuestro catálogo, revisa sus detalles y combina varios servicios en una sola reserva.</p></div>
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

      {canEditImages && <div className="mb-6 rounded-2xl border border-[#E5D3B3]/50 bg-[#E5D3B3]/15 p-4"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#5D4037]">Editor de imágenes del catálogo</p><div className="flex flex-col gap-3 sm:flex-row"><select value={editingImageId} onChange={(event) => setEditingImageId(event.target.value)} className="h-11 flex-1 rounded-xl border-none bg-white px-3 text-sm text-[#5D4037] outline-none"><option value="">Elige un servicio</option>{services.filter((service) => !service.id.startsWith("catalog-")).map((service) => <option key={service.id} value={service.id}>{service.nombre}</option>)}</select><label className={cn("inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#5D4037] px-5 text-[10px] font-bold uppercase tracking-widest text-white", (!editingImageId || uploadingImage) && "pointer-events-none opacity-50")}>{uploadingImage ? "Publicando..." : "Elegir foto"}<input type="file" accept="image/*" onChange={handlePublicImageUpload} disabled={!editingImageId || uploadingImage} className="hidden" /></label></div><p className="mt-2 text-xs text-[#5D4037]/65">Solo visible para crisdelrobbys@gmail.com. La foto se publica inmediatamente en el catálogo.</p></div>}

      {loading ? <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60">Cargando servicios...</div>
        : error ? <div className="rounded-2xl border border-red-100 bg-red-50 py-16 text-center text-red-600">{error}</div>
        : <>{catalogWarning && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{catalogWarning}</div>}{!filteredServices.length ? <div className="rounded-2xl bg-white py-16 text-center text-[#5D4037]/60"><p className="mb-4">No encontramos servicios con esos filtros.</p><button type="button" onClick={clearFilters} className="rounded-full bg-[#5D4037] px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-white">Ver todos</button></div>
        : <div className="space-y-14">{groupedServices.map(({ category, count, sections }) => <section key={category} aria-labelledby={`category-${category}`}>
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#E5D3B3]/40 pb-4"><div><span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8D6E63]">Especialidad Marobel</span><h2 id={`category-${category}`} className="mt-1 font-serif text-3xl text-[#5D4037] md:text-4xl">{category}</h2></div><span className="shrink-0 rounded-full bg-[#E5D3B3]/25 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]">{count} servicio{count === 1 ? "" : "s"}</span></div>
          <div className="space-y-9">{sections.map(({ section, items }) => <div key={section}>
            {section !== category && <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-[#8D6E63]"><span className="h-px w-8 bg-[#E5D3B3]" />{section}</h3>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((service) => {
              const selected = selectedServices.some((item) => item.id === service.id);
              const imageFocus = serviceImageFocus[service.nombre] || "50% 50%";
              const imageClass = service.imagen_url ? (service.imagen_ajuste === "contain" ? "h-full w-full object-contain p-2" : "h-full w-full object-cover") : (serviceImageClass[service.nombre] || "h-full w-full object-cover");
              const imageTransform = serviceImageTransform[service.nombre];
              return <article key={service.id} className={cn("flex overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg", selected ? "border-[#5D4037] ring-2 ring-[#5D4037]/10" : "border-[#E5D3B3]/30")}>
                <div className="flex w-full flex-col">
                  {canEditImagesInline && <div className="border-b border-[#E5D3B3]/40 bg-[#E5D3B3]/10 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037]">Editar imagen</p><button type="button" onClick={() => setEditingImageId(editingImageId === service.id ? "" : service.id)} className="text-[10px] font-bold uppercase tracking-widest text-[#8D6E63]">{editingImageId === service.id ? "Cerrar" : "Abrir"}</button></div>{editingImageId === service.id && <div className="space-y-2"><div className="grid grid-cols-2 gap-2"><input type="number" min="320" max="2400" value={cropWidth} onChange={(event) => setCropWidth(Number(event.target.value))} className="h-9 rounded-lg border-none bg-white px-2 text-xs" aria-label="Ancho en píxeles" placeholder="Ancho px" /><input type="number" min="240" max="2400" value={cropHeight} onChange={(event) => setCropHeight(Number(event.target.value))} className="h-9 rounded-lg border-none bg-white px-2 text-xs" aria-label="Alto en píxeles" placeholder="Alto px" /></div><label className="inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-lg bg-[#5D4037] text-[9px] font-bold uppercase tracking-widest text-white">Elegir y recortar<input type="file" accept="image/*" onChange={handlePublicImageUpload} disabled={uploadingImage} className="hidden" /></label><button type="button" onClick={async () => { const { error: deleteError } = await supabase.from("servicios").update({ imagen_url: null }).eq("id", service.id); if (deleteError) toast.error(`No se pudo borrar: ${deleteError.message}`); else { setServices((previous) => previous.map((item) => item.id === service.id ? { ...item, imagen_url: undefined } : item)); toast.success("Imagen borrada"); } }} className="h-9 w-full rounded-lg border border-red-200 text-[9px] font-bold uppercase tracking-widest text-red-600">Borrar imagen</button></div>}</div>}
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-[#E5D3B3]/20 sm:h-44"><img src={getServiceImage(service.nombre, service.imagen_url)} alt={`${service.nombre} en Marobel`} className={cn(imageClass, "transition duration-500", !imageTransform && !noHoverZoom.has(service.nombre) && "hover:scale-105")} style={{ objectPosition: service.imagen_posicion || imageFocus, transform: imageTransform, transformOrigin: "center" }} loading="lazy" referrerPolicy="no-referrer" /></div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-start justify-between gap-3"><h4 className="font-serif text-xl leading-tight text-[#5D4037]">{service.nombre}</h4><span className="whitespace-nowrap text-sm font-bold text-[#8D6E63]">{priceLabel(service)}</span></div>
                    {service.duracion && <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]/50"><Clock className="h-3.5 w-3.5" />{service.duracion}</p>}
                    <p className="mb-5 flex-1 text-xs leading-relaxed text-[#5D4037]/65">{service.descripcion}</p>
                    <button type="button" onClick={() => toggleService(service)} className={cn("w-full rounded-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition", selected ? "bg-[#E5D3B3] text-[#5D4037]" : "bg-[#5D4037] text-white hover:bg-[#4a332c]")}>{selected ? "Quitar de la reserva" : "Agregar a mi reserva"}</button>
                  </div>
                </div>
              </article>;
            })}</div>
          </div>)}</div>
        </section>)}</div>}</>}

      {!loading && !error && <aside className="mt-12 rounded-2xl border border-[#E5D3B3]/50 bg-[#E5D3B3]/15 p-5 text-[#5D4037] md:p-7"><div className="flex items-start gap-4"><Info className="mt-0.5 h-5 w-5 shrink-0 text-[#8D6E63]" /><div><h2 className="mb-2 font-serif text-2xl">Información importante</h2><p className="text-sm leading-relaxed text-[#5D4037]/75">Los precios indicados como <strong>“desde”</strong> pueden variar según el largo y la cantidad del cabello, el tamaño de las uñas, el diseño, la técnica seleccionada o la cantidad de producto utilizado.</p><p className="mt-2 text-sm leading-relaxed text-[#5D4037]/75">Para recibir una cotización exacta, comunícate con nosotros o agenda una valoración.</p></div></div></aside>}
    </section>

    {selectedServices.length > 0 && <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-[#5D4037] p-3 text-white shadow-2xl md:hidden"><Link to="/reserva" className="flex items-center justify-between"><span className="text-xs font-bold">{selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""} seleccionado{selectedServices.length > 1 ? "s" : ""}</span><span className="rounded-full bg-[#E5D3B3] px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]">Continuar</span></Link></div>}
  </main>;
}

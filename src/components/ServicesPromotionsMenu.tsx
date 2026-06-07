import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles, Tag } from "lucide-react";
import type { Promotion } from "./AdminPromotions";
import { useSelection } from "@/context/SelectionContext";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  duracion: string;
}

interface ServicesPromotionsMenuProps {
  services: Service[];
}

export default function ServicesPromotionsMenu({ services }: ServicesPromotionsMenuProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { addService } = useSelection();

  useEffect(() => {
    const saved = localStorage.getItem("marobel_promotions");
    if (!saved) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const activePromotions = (JSON.parse(saved) as Promotion[]).filter(
        (promotion) => promotion.isActive && promotion.startDate <= today && promotion.endDate >= today
      );
      setPromotions(activePromotions);

      const requestedPromotion = new URLSearchParams(location.search).get("promo");
      const initialPromotion = activePromotions.find((promotion) => promotion.id === requestedPromotion) ?? activePromotions[0];
      setSelectedPromotionId(initialPromotion?.id ?? null);

      if (requestedPromotion) {
        window.setTimeout(() => {
          document.getElementById("promociones-servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (error) {
      console.error("Error parsing promotions", error);
    }
  }, [location.search]);

  const selectedPromotion = useMemo(
    () => promotions.find((promotion) => promotion.id === selectedPromotionId) ?? promotions[0],
    [promotions, selectedPromotionId]
  );

  const includedServices = useMemo(
    () => (selectedPromotion?.services ?? []).map((serviceId) => services.find((service) => service.id === serviceId)).filter((service): service is Service => Boolean(service)),
    [selectedPromotion, services]
  );

  if (!selectedPromotion || promotions.length === 0) return null;

  const reservePromotion = () => {
    const totalMinutes = includedServices.reduce((total, service) => total + Number(service.duracion?.match(/\d+/)?.[0] ?? 60), 0);
    addService({
      id: `promo-${selectedPromotion.id}`,
      name: selectedPromotion.name,
      price: Number(selectedPromotion.discountPrice),
      category: "Promocion",
      description: includedServices.map((service) => service.nombre).join(", "),
      duration: `${totalMinutes || 60} min`,
    });
    navigate("/reserva");
  };

  return (
    <div id="promociones-servicios" className="scroll-mt-28 mb-20 rounded-[2rem] border border-[#E5D3B3]/40 bg-white p-5 shadow-lg md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]"><Sparkles className="h-4 w-4" />Mini menu</span>
          <h2 className="font-serif text-3xl text-[#5D4037]">Promociones del mes</h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#5D4037]/60">Elige una promocion para revisar exactamente los servicios incluidos antes de reservar.</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {promotions.map((promotion) => (
          <button key={promotion.id} type="button" onClick={() => setSelectedPromotionId(promotion.id)} className={cn("shrink-0 rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition", selectedPromotion.id === promotion.id ? "bg-[#5D4037] text-white shadow-md" : "border border-[#E5D3B3] bg-[#FAF9F6] text-[#5D4037] hover:border-[#5D4037]")}>{promotion.name}</button>
        ))}
      </div>

      <div className="grid gap-6 rounded-3xl bg-[#FAF9F6] p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl text-[#5D4037]">{selectedPromotion.name}</h3>
            {selectedPromotion.badge && <span className="rounded-full bg-[#E5D3B3] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#5D4037]">{selectedPromotion.badge}</span>}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[#5D4037]/65">{selectedPromotion.description}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {includedServices.length > 0 ? includedServices.map((service) => (
              <div key={service.id} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#5D4037]"><Check className="h-4 w-4 shrink-0 text-[#8D6E63]" />{service.nombre}</div>
            )) : <p className="text-sm text-[#5D4037]/55">Consulta los detalles de esta promocion con administracion.</p>}
          </div>
        </div>

        <div className="min-w-[210px] rounded-2xl bg-white p-5 text-center shadow-sm">
          <Tag className="mx-auto mb-2 h-5 w-5 text-[#8D6E63]" />
          <span className="block text-[9px] font-bold uppercase tracking-widest text-[#5D4037]/45">Precio promocional</span>
          <span className="my-2 block text-3xl font-bold text-[#8D6E63]">${Number(selectedPromotion.discountPrice).toFixed(2)}</span>
          <button type="button" onClick={reservePromotion} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5D4037] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-[#4a332c]">Reservar promocion<ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

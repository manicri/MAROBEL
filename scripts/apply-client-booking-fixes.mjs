import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const write = (path, content) => fs.writeFileSync(path, content);
const replace = (content, search, replacement, label) => {
  if (!content.includes(search)) throw new Error(`No se encontro: ${label}`);
  return content.replace(search, replacement);
};

let calendar = read('src/components/Calendar.tsx');
calendar = replace(calendar, 'onSelectSlot: (time: string) => void;', 'onSelectSlot: (time: string | null) => void;', 'Calendar callback');
calendar = replace(calendar, '  const [isFullDayBlocked, setIsFullDayBlocked] = useState(false);', "  const [isFullDayBlocked, setIsFullDayBlocked] = useState(false);\n  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);\n  const [availabilityError, setAvailabilityError] = useState<string | null>(null);", 'Calendar loading state');
calendar = replace(calendar, '    const fetchBookedSlots = async () => {\n      // Fetch Citas', "    const fetchBookedSlots = async () => {\n      setIsLoadingAvailability(true);\n      setAvailabilityError(null);\n      // Fetch Citas", 'Calendar fetch start');
calendar = replace(calendar, "      if (citasError) console.error('Error fetching booked slots:', citasError);\n      else if (citasData) {", "      if (citasError) {\n        console.error('Error fetching booked slots:', citasError);\n        setAvailabilityError('No se pudo validar la agenda. Intentalo de nuevo.');\n      } else if (citasData) {", 'Calendar citas error');
calendar = replace(calendar, "      if (bloqueosError) {\n        console.error('Error fetching bloqueos:', bloqueosError);", "      if (bloqueosError) {\n        console.error('Error fetching bloqueos:', bloqueosError);\n        setAvailabilityError('No se pudieron validar los bloqueos de administracion.');", 'Calendar bloqueos error');
calendar = replace(calendar, "        setIsFullDayBlocked(bloqueosData.some(b => b.hora === null));\n      }\n    };", "        setIsFullDayBlocked(bloqueosData.some(b => b.hora === null));\n      }\n      setIsLoadingAvailability(false);\n    };", 'Calendar fetch end');
calendar = replace(calendar, "  const isSlotAvailable = (time: string) => {\n    if (isFullDayBlocked) return false;", "  const isSlotAvailable = (time: string) => {\n    if (isLoadingAvailability || availabilityError) return false;\n    if (isFullDayBlocked) return false;", 'Calendar fail closed');
calendar = replace(calendar, "    return true;\n  };\n\n  return (", "    return true;\n  };\n\n  useEffect(() => {\n    if (isAdmin || !selectedTime || isLoadingAvailability) return;\n    const normalizedSelectedTime = normalizeTime(selectedTime);\n    if (availabilityError || isFullDayBlocked || adminBlockedSlots.includes(normalizedSelectedTime) || !isSlotAvailable(normalizedSelectedTime)) {\n      onSelectSlot(null);\n      toast.info('El horario seleccionado ya no esta disponible. Elige otro horario.');\n    }\n  }, [adminBlockedSlots, availabilityError, bookedSlots, hours, isAdmin, isFullDayBlocked, isLoadingAvailability, selectedTime, totalDuration]);\n\n  return (", 'Calendar selected validation');
calendar = replace(calendar, '      {isFullDayBlocked ? (', `      {isLoadingAvailability ? (\n        <div className="col-span-full py-10 text-center bg-[#FAF9F6] rounded-2xl border border-[#E5D3B3]/40">\n          <p className="text-[#5D4037] font-bold uppercase tracking-widest text-sm">Validando disponibilidad...</p>\n          <p className="text-[#5D4037]/55 text-xs mt-2">Estamos revisando bloqueos y citas antes de mostrar horarios.</p>\n        </div>\n      ) : availabilityError ? (\n        <div className="col-span-full py-10 text-center bg-red-50 rounded-2xl border border-red-100 px-4">\n          <Lock className="w-7 h-7 text-red-400 mx-auto mb-3" />\n          <p className="text-red-700 font-bold uppercase tracking-widest text-sm">Disponibilidad no confirmada</p>\n          <p className="text-red-500 text-xs mt-2">{availabilityError}</p>\n        </div>\n      ) : isFullDayBlocked ? (`, 'Calendar loading UI');
calendar = replace(calendar, '                if (!isBooked) onSelectSlot(time);', '                if (!isFullDayBlocked && !isBlockedByAdmin && isAvailable) onSelectSlot(time);', 'Calendar click guard');
write('src/components/Calendar.tsx', calendar);

let reservation = read('src/components/ReservationForm.tsx');
reservation = replace(reservation, "    fetchServices();\n  }, []);", "    fetchServices();\n  }, []);\n\n  React.useEffect(() => {\n    setSelectedTime(null);\n  }, [selectedDate]);", 'Reservation clears time');
reservation = replace(reservation, "    setIsSubmitting(true);", `    const { data: currentBlocks, error: blocksError } = await supabase\n      .from("bloqueos")\n      .select("hora")\n      .eq("fecha", selectedDate);\n\n    if (blocksError) {\n      toast.error("No se pudo confirmar la disponibilidad. Intenta nuevamente.");\n      console.error(blocksError);\n      return;\n    }\n\n    const normalizeBlockedTime = (time: string) => {\n      const [hours, minutes] = time.split(":");\n      return \`${'${Number(hours)}'}:${'${minutes?.slice(0, 2) || "00"}'}\`;\n    };\n\n    const selectedSlotWasBlocked = (currentBlocks ?? []).some(\n      (block) => block.hora === null || normalizeBlockedTime(block.hora) === normalizeBlockedTime(selectedTime!)\n    );\n\n    if (selectedSlotWasBlocked) {\n      setSelectedTime(null);\n      toast.error("Ese dia u horario fue bloqueado por administracion. Selecciona otra opcion.");\n      return;\n    }\n\n    setIsSubmitting(true);`, 'Reservation final block check');
write('src/components/ReservationForm.tsx', reservation);

let admin = read('src/components/AdminDashboard.tsx');
admin = replace(admin, '                  onSelectDate={setSelectedDate} \n                />', '                  onSelectDate={setSelectedDate} \n                  isAdmin\n                />', 'Admin date picker');
write('src/components/AdminDashboard.tsx', admin);

let services = read('src/components/Services.tsx');
services = replace(services, 'import { supabase } from "../supabase";', 'import { supabase } from "../supabase";\nimport ServicesPromotionsMenu from "./ServicesPromotionsMenu";', 'Services import');
services = replace(services, '        <div id="servicios-anchor"', '        <ServicesPromotionsMenu services={services} />\n\n        <div id="servicios-anchor"', 'Services promotions menu');
services = services.replace(/\s*<div className="mt-16">\s*<p[^>]*>¿Lista para tu momento de belleza\?<\/p>\s*<Link[\s\S]*?Agenda tu cita hoy\s*<\/Link>\s*<\/div>/, '');
if (services.includes('Agenda tu cita hoy')) throw new Error('No se elimino el CTA final');
write('src/components/Services.tsx', services);

let publicPromotions = read('src/components/PublicPromotions.tsx');
publicPromotions = replace(publicPromotions, '<section className="py-24 bg-[#FAF9F6]">', '<section id="promociones" className="py-24 bg-[#FAF9F6]">', 'Promotions section id');
publicPromotions = publicPromotions.replace(/<a\s+href="\/#reservas"([\s\S]*?)>\s*Reservar Ahora\s*(<ArrowRight[^>]*\/>\s*)<\/a>/, '<Link\n                  to={`/?promo=${encodeURIComponent(promo.id)}#promociones-servicios`}\n                  $1>\n                  Ver servicios incluidos\n                  $2</Link>');
if (!publicPromotions.includes('Ver servicios incluidos')) throw new Error('No se actualizo el boton de promociones');
write('src/components/PublicPromotions.tsx', publicPromotions);

fs.rmSync('scripts/apply-client-booking-fixes.mjs');
fs.rmSync('.github/workflows/apply-client-booking-fixes.yml');

import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-[#5D4037] text-white pt-32 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <h3 className="text-3xl font-serif font-bold tracking-tighter text-[#E5D3B3]">MAROBEL</h3>
            <p className="text-white/60 font-light leading-relaxed text-sm">
              Tu santuario de belleza y bienestar en Guayaquil. Donde cada detalle está diseñado para tu transformación.
            </p>
            <div className="flex items-center space-x-6">
              <a href="https://www.instagram.com/marobel.studio/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E5D3B3] hover:text-[#5D4037] transition-all duration-500"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E5D3B3] hover:text-[#5D4037] transition-all duration-500"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Contacto</h4>
            <ul className="space-y-6 text-white/60 font-light text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <a href="https://maps.app.goo.gl/7ciYuBG8zAVHtitv7?g_st=ac" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Marobel Beauty Studio, Guayaquil</a>
              </li>
              <li className="flex items-center gap-4"><Phone className="w-5 h-5 text-[#E5D3B3] shrink-0" /><span>+593 96 927 2530</span></li>
              <li className="flex items-center gap-4"><Mail className="w-5 h-5 text-[#E5D3B3] shrink-0" /><span>hola@marobel.studio</span></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Horarios</h4>
            <ul className="space-y-6 text-white/60 font-light text-sm">
              <li className="flex items-start gap-4"><Clock className="w-5 h-5 text-[#E5D3B3] shrink-0" /><div><p className="font-bold text-white mb-1">Lunes a Viernes</p><p>9:00 AM — 6:00 PM</p></div></li>
              <li className="flex items-start gap-4"><Clock className="w-5 h-5 text-[#E5D3B3] shrink-0" /><div><p className="font-bold text-white mb-1">Sábados</p><p>10:00 AM — 6:00 PM</p></div></li>
              <li className="text-[#E5D3B3] italic text-xs">Domingos: Cerrado</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Ubicación</h4>
            <div className="rounded-3xl overflow-hidden h-48 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 shadow-2xl border border-white/10">
              <iframe src="https://www.google.com/maps?q=V37W%2BWWW%20marobel.beautystudio%2C%20090507%20Guayaquil&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Ubicación de Marobel Beauty Studio"></iframe>
            </div>
            <a href="https://maps.app.goo.gl/7ciYuBG8zAVHtitv7?g_st=ac" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#E5D3B3] transition-colors hover:text-white"><MapPin className="h-4 w-4" />Cómo llegar</a>
          </div>
        </div>

        <Separator className="bg-white/10 mb-12" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">
          <p>© {new Date().getFullYear()} Marobel. Todos los derechos reservados.</p>
          <div className="flex gap-10"><a href="#" className="hover:text-white transition-colors">Privacidad</a><a href="#" className="hover:text-white transition-colors">Términos</a></div>
        </div>
      </div>
    </footer>
  );
}

import { Instagram, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-[#5D4037] text-white pt-32 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <h3 className="text-3xl font-serif font-bold tracking-tighter text-[#E5D3B3]">
              MAROBEL <span className="font-light italic text-white">Studio</span>
            </h3>
            <p className="text-white/60 font-light leading-relaxed text-sm">
              Tu santuario de belleza y bienestar en Guayaquil. 
              Donde cada detalle está diseñado para tu transformación.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E5D3B3] hover:text-[#5D4037] transition-all duration-500">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E5D3B3] hover:text-[#5D4037] transition-all duration-500">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Contacto</h4>
            <ul className="space-y-6 text-white/60 font-light text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <span>La Alborada, Guayaquil, Ecuador</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <span>+593 90 000 0000</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <span>hola@marobel.studio</span>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Horarios</h4>
            <ul className="space-y-6 text-white/60 font-light text-sm">
              <li className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <div>
                  <p className="font-bold text-white mb-1">Lunes a Viernes</p>
                  <p>9:00 AM — 6:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#E5D3B3] shrink-0" />
                <div>
                  <p className="font-bold text-white mb-1">Sábados</p>
                  <p>10:00 AM — 6:00 PM</p>
                </div>
              </li>
              <li className="text-[#E5D3B3] italic text-xs">Domingos: Cerrado</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] text-[#E5D3B3]">Ubicación</h4>
            <div className="rounded-3xl overflow-hidden h-48 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 shadow-2xl border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0123456789!2d-79.89!3d-2.14!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwMDgnMjQuMCJTIDc5wrA1MycyNC4wIlc!5e0!3m2!1ses!2sec!4v1234567890123!5m2!1ses!2sec"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-12" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">
          <p>© {new Date().getFullYear()} Marobel Studio. Todos los derechos reservados.</p>
          <div className="flex gap-10">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

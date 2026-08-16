import { motion } from "motion/react";
import { Instagram } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop",
];

export default function InstagramGallery() {
  return (
    <section id="galeria" className="bg-white px-5 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#8D6E63]">Nuestro universo</span>
            <h2 className="font-serif text-3xl text-[#5D4037] md:text-5xl">Estilo Marobel</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5D4037]/60">Inspiración visual, cuidado y detalles que acompañan cada servicio.</p>
          </motion.div>
          <a href="https://www.instagram.com/marobel.studio/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5D4037]"><Instagram className="h-4 w-4" />@marobel.studio</a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {images.map((src, index) => (
            <motion.a key={src} href="https://www.instagram.com/marobel.studio/" target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#E5D3B3]/20 shadow-sm">
              <img src={src} alt={`Estilo Marobel ${index + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#5D4037]/70 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100"><span className="text-[9px] font-bold uppercase tracking-widest text-white">Ver en Instagram</span></div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

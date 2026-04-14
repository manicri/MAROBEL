import { motion } from "motion/react";
import { Instagram } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop",
];

export default function InstagramGallery() {
  return (
    <section id="galeria" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Nuestro Universo
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-[#5D4037] mb-8">
              Estilo Marobel
            </h2>
            <p className="text-[#5D4037]/60 font-light leading-relaxed">
              Síguenos en <a href="https://instagram.com/marobel.studio" target="_blank" className="text-[#5D4037] font-bold hover:underline">@marobel.studio</a> y descubre <br className="hidden md:block" /> nuestras últimas transformaciones y rituales de belleza.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-[2.5rem] cursor-pointer shadow-2xl"
            >
              <a 
                href="https://www.instagram.com/marobel.studio/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                <img
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback para imágenes rotas
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-[#5D4037]/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <Instagram className="w-8 h-8 text-white mx-auto mb-3" />
                    <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">Ver Ritual</span>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

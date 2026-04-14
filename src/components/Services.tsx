import { motion } from "framer-motion";
import { Scissors, Sparkles, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Cabello",
    description: "Cortes de vanguardia, coloración premium y tratamientos de keratina para un brillo inigualable.",
    icon: Scissors,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
    items: ["Balayage", "Corte Dama", "Alisados", "Hidratación"],
    link: "/cabello"
  },
  {
    title: "Uñas",
    description: "Manicura rusa, uñas acrílicas y pedicura SPA con los mejores productos del mercado.",
    icon: Star,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
    items: ["Acrílicas", "Gelish", "SPA Pedicura", "Nail Art"],
    link: "/unas"
  },
  {
    title: "Estética Facial",
    description: "Limpiezas profundas y tratamientos rejuvenecedores para una piel radiante y saludable.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1570172619245-711f83f5fd19?q=80&w=2070&auto=format&fit=crop",
    items: ["Limpieza Profunda", "Peeling", "Microdermabrasión"],
    link: "/estetica-facial"
  },
  {
    title: "Rituales Spa",
    description: "Masajes relajantes y descontracturantes en un ambiente de paz absoluta.",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop",
    items: ["Masaje Relajante", "Piedras Volcánicas", "Exfoliación"],
    link: "/rituales"
  }
];

export default function Services() {
  return (
    <section id="servicios" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
              Nuestra Colección
            </span>
            <h2 className="text-5xl md:text-6xl font-serif text-[#5D4037] mb-8">
              Servicios Exclusivos
            </h2>
            <p className="text-[#5D4037]/60 font-light leading-relaxed">
              Cada tratamiento es un ritual diseñado para realzar tu belleza natural 
              y brindarte un momento de desconexión total.
            </p>
          </motion.div>
        </div>

        <div id="servicios-anchor" className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col"
            >
              <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-2xl">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037] via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <service.icon className="w-8 h-8 text-[#E5D3B3] mb-4" />
                  <h3 className="text-2xl font-serif text-white mb-2">{service.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.items.map(item => (
                      <span key={item} className="text-[8px] uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#5D4037]/70 font-light leading-relaxed px-4 mb-6 flex-grow">
                {service.description}
              </p>
              <div className="px-4 mt-auto">
                <Link 
                  to={service.link}
                  className="inline-block w-full text-center py-3 rounded-full border-2 border-[#5D4037] text-[#5D4037] font-bold text-xs uppercase tracking-widest hover:bg-[#5D4037] hover:text-white transition-colors duration-300"
                >
                  Ver Servicios
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

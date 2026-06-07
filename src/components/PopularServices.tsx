import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelection } from "../context/SelectionContext";

const popularServices = [
  {
    id: "fav1",
    name: "Balayage",
    desc: "Iluminación natural y elegante para tu cabello.",
    price: 120,
    img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
    category: "Cabello",
  },
  {
    id: "fav2",
    name: "Acrílicas",
    desc: "Uñas perfectas y duraderas con diseños exclusivos.",
    price: 40,
    img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
    category: "Uñas",
  },
  {
    id: "fav3",
    name: "Masaje Relajante",
    desc: "Desconexión total para aliviar el estrés.",
    price: 70,
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop",
    category: "Rituales Spa",
  },
];

export default function PopularServices() {
  const { addService } = useSelection();
  const navigate = useNavigate();

  return (
    <section className="mt-20 rounded-[3rem] bg-white p-8 shadow-sm border border-[#E5D3B3]/20 md:p-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
          Los Favoritos
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-4">
          Servicios Más Solicitados
        </h2>
        <p className="text-sm text-[#5D4037]/60">
          Atajos rápidos para sumar los tratamientos preferidos a tu reserva.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {popularServices.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#FAF9F6] rounded-3xl overflow-hidden shadow-lg border border-[#E5D3B3]/20 flex flex-col"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-xl font-serif font-bold text-[#5D4037]">{item.name}</h3>
                <span className="text-lg font-bold text-[#8D6E63]">${item.price}</span>
              </div>
              <p className="text-sm text-[#5D4037]/70 mb-6 flex-grow">{item.desc}</p>
              <button
                type="button"
                onClick={() => {
                  addService({ id: item.id, name: item.name, price: item.price, category: item.category });
                  navigate("/reserva");
                }}
                className="w-full text-center py-3 rounded-full bg-[#E5D3B3] text-[#5D4037] font-bold text-xs uppercase tracking-widest hover:bg-[#d4c2a3] transition-colors"
              >
                Agregar y reservar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

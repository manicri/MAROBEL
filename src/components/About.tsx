import { motion } from "motion/react";
import { Sparkles, ShieldCheck, Clock } from "lucide-react";

export default function About() {
  return (
    <section id="nosotros" className="py-32 bg-[#FAF9F6] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1920&auto=format&fit=crop"
                alt="Marobel Interior"
                className="w-full h-[600px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#E5D3B3] rounded-3xl -z-0 opacity-20"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 border-2 border-[#5D4037]/10 rounded-full -z-0"></div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="absolute top-1/2 -right-12 bg-white p-8 rounded-2xl shadow-2xl z-20 hidden md:block max-w-[200px]"
            >
              <p className="text-4xl font-serif text-[#5D4037] mb-2">10+</p>
              <p className="text-[10px] uppercase tracking-widest text-[#5D4037]/60 font-bold">Años de Excelencia</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <span className="text-[#8D6E63] font-medium tracking-[0.4em] uppercase text-xs mb-4 block">
                Nuestra Esencia
              </span>
              <h2 className="text-5xl md:text-6xl font-serif text-[#5D4037] mb-8 leading-tight">
                Donde la elegancia <br /> se encuentra con <br /> <span className="italic font-light">el bienestar</span>
              </h2>
              <p className="text-[#5D4037]/70 font-light leading-relaxed text-lg">
                En Marobel, creemos que la belleza es un reflejo de tu paz interior. 
                Ubicados en el corazón de la Alborada, Guayaquil, hemos creado un espacio 
                donde cada detalle está pensado para tu confort y transformación.
              </p>
            </div>

            <div className="grid gap-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5D4037] mb-2">Atención Personalizada</h4>
                  <p className="text-sm text-[#5D4037]/60 font-light">Cada cliente es único. Diseñamos rituales específicos para tus necesidades y deseos.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <div>
                  <h4 className="text-lg font-serif text-[#5D4037] mb-2">Productos Premium</h4>
                  <p className="text-sm text-[#5D4037]/60 font-light">Utilizamos solo las mejores marcas internacionales para garantizar resultados excepcionales.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="p-8 bg-[#5D4037] rounded-3xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-sm font-light italic mb-4 opacity-80">"Nuestra misión es que salgas de aquí sintiéndote la mejor versión de ti misma."</p>
                  <p className="text-xs uppercase tracking-widest font-bold text-[#E5D3B3]">Fundadora de Marobel</p>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

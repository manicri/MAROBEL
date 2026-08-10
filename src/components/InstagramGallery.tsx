import { Instagram } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=900&auto=format&fit=crop",
];

export default function InstagramGallery() {
  return <section id="galeria" className="bg-[#fdfbf7] px-5 py-20 sm:px-6 md:py-28"><div className="mx-auto max-w-7xl"><div className="mb-12 grid gap-6 border-b border-[#d9cabb] pb-8 md:grid-cols-[1fr_auto] md:items-end"><div><span className="marobel-kicker">Una mirada a Marobel</span><h2 className="mt-4 text-5xl leading-none text-[#3d302b] md:text-6xl">Rituales, texturas y <em className="text-[#98735f]">detalle.</em></h2></div><a href="https://www.instagram.com/marobel.studio/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#3d302b] underline decoration-[#c58d72] underline-offset-8"><Instagram className="h-4 w-4" /> @marobel.studio</a></div><div className="grid gap-4 md:grid-cols-12 md:grid-rows-[220px_220px]"><GalleryImage src={images[0]} className="md:col-span-5 md:row-span-2" index={1} /><GalleryImage src={images[1]} className="md:col-span-3" index={2} /><GalleryImage src={images[2]} className="md:col-span-4" index={3} /><GalleryImage src={images[3]} className="md:col-span-7" index={4} /></div></div></section>;
}

function GalleryImage({ src, className, index }: { src: string; className: string; index: number }) {
  return <a href="https://www.instagram.com/marobel.studio/" target="_blank" rel="noopener noreferrer" className={`group relative block min-h-[260px] overflow-hidden bg-[#e9ded2] ${className}`}><img src={src} alt={`Detalle de Marobel ${index}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" referrerPolicy="no-referrer" /><div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-[#3d302b]/85 px-4 py-3 transition duration-300 group-hover:translate-y-0"><span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white">Ver en Instagram</span><Instagram className="h-4 w-4 text-[#e8d8bd]" /></div></a>;
}

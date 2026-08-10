import React, { useEffect, useState } from "react";
import { LogIn, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { ProfileModal } from "./ProfileModal";
import { toast } from "sonner";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => toast("¿Quieres cerrar sesión?", { action: { label: "Cerrar sesión", onClick: async () => { await logout(); setIsMenuOpen(false); toast.success("Sesión cerrada"); } }, cancel: { label: "Cancelar", onClick: () => {} } });
  const handleHomeClick = (event: React.MouseEvent) => { setIsMenuOpen(false); if (window.location.pathname === "/") { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const linkClass = "text-[10px] font-bold uppercase tracking-[0.22em] text-[#3d302b]/70 transition hover:text-[#98735f]";

  return <>
    <nav className={`fixed left-0 right-0 top-0 z-50 border-b border-[#d9cabb]/70 bg-[#fdfbf7]/90 transition-all duration-300 backdrop-blur ${isScrolled ? "py-3 shadow-[0_8px_30px_rgba(61,48,43,0.07)]" : "py-4"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 sm:px-6">
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 text-[#3d302b]"><span className="font-serif text-2xl tracking-[0.12em]">MAROBEL</span><span className="hidden h-px w-8 bg-[#c58d72] sm:block" /><span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[#98735f] sm:block">Beauty studio</span></Link>
        <div className="hidden items-center gap-8 md:flex"><Link to="/" onClick={handleHomeClick} className={linkClass}>Inicio</Link><Link to="/servicios" className={linkClass}>Servicios</Link><a href="/#nosotros" className={linkClass}>Nuestra esencia</a>{isAdmin && <Link to="/admin" className="border-b border-[#c58d72] pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#98735f]">Admin</Link>}<CartButton onClick={() => setIsCartOpen(true)} />{user ? <div className="flex items-center gap-3 border-l border-[#d9cabb] pl-5"><button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 text-left"><img src={profile?.photoURL || user.user_metadata?.avatar_url || ""} className="h-8 w-8 rounded-full object-cover" alt="Avatar" referrerPolicy="no-referrer" /><span className="hidden max-w-[130px] truncate text-xs font-semibold text-[#3d302b] lg:block">{profile?.displayName || user.user_metadata?.full_name}</span></button><Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0 text-[#3d302b] hover:bg-[#f1ebe2]"><LogOut className="h-4 w-4" /></Button></div> : <Button onClick={login} className="h-9 rounded-none bg-[#3d302b] px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-[#98735f]"><LogIn className="mr-2 h-3.5 w-3.5" />Ingresar</Button>}</div>
        <div className="flex items-center gap-3 md:hidden"><CartButton onClick={() => setIsCartOpen(true)} />{!user && <Button onClick={login} className="h-9 rounded-none bg-[#3d302b] px-4 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#98735f]">Ingresar</Button>}{user && <button onClick={() => setIsProfileModalOpen(true)}><img src={profile?.photoURL || user.user_metadata?.avatar_url || ""} className="h-8 w-8 rounded-full object-cover" alt="Avatar" referrerPolicy="no-referrer" /></button>}<Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}><SheetTrigger className="p-2 text-[#3d302b]"><Menu className="h-5 w-5" /></SheetTrigger><SheetContent side="right" className="border-l-[#d9cabb] bg-[#fdfbf7] text-[#3d302b]" aria-describedby={undefined}><SheetTitle className="mt-4 font-serif text-3xl text-[#3d302b]">MAROBEL</SheetTitle><div className="mt-10 flex flex-col gap-6"><Link to="/" onClick={handleHomeClick} className={linkClass}>Inicio</Link><Link to="/servicios" onClick={() => setIsMenuOpen(false)} className={linkClass}>Servicios</Link><a href="/#nosotros" onClick={() => setIsMenuOpen(false)} className={linkClass}>Nuestra esencia</a>{isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={linkClass}>Admin</Link>}{user && <Button onClick={handleLogout} variant="outline" className="mt-4 w-full rounded-none border-[#d9cabb] text-[#3d302b]">Cerrar sesión</Button>}</div></SheetContent></Sheet></div>
      </div>
    </nav>
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
  </>;
}

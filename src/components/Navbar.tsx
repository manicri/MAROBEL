import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, LogIn, LogOut, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { ProfileModal } from "./ProfileModal";
import { toast } from "sonner";
import CartButton from "./CartButton";
import CartDrawer from "./CartDrawer";
import PushNotificationButton from "./PushNotificationButton";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => toast("¿Estas seguro de que deseas cerrar sesion?", { action: { label: "Cerrar sesion", onClick: async () => { await logout(); setIsMenuOpen(false); toast.success("Sesion cerrada correctamente"); } }, cancel: { label: "Cancelar", onClick: () => {} } });
  const handleHomeClick = (event: React.MouseEvent) => { setIsMenuOpen(false); if (window.location.pathname === "/") { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const navLinkClass = "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10 hover:text-[#E5D3B3]";

  return <>
    <nav className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 transition-all duration-300 ${isScrolled ? "bg-[#4a332c]/95 py-2 shadow-xl backdrop-blur-xl" : "bg-[#2d211d]/55 py-3 backdrop-blur-md"}`}>
      <div className="container mx-auto flex items-center justify-between gap-4 px-5">
        <Link to="/" onClick={handleHomeClick} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/15 hover:text-[#E5D3B3]"><Home className="h-4 w-4" />Inicio</Link>
        <div className="hidden items-center gap-2 md:flex"><div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 shadow-lg"><Link to="/servicios" className={navLinkClass}>Servicios</Link>{isAdmin && <Link to="/admin" className="rounded-full bg-[#E5D3B3] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5D4037] transition hover:bg-white">Admin</Link>}</div><CartButton onClick={() => setIsCartOpen(true)} />{user ? <><PushNotificationButton /><div className="flex items-center gap-2 rounded-full bg-white/10 p-1 pl-2"><button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/10"><img src={profile?.photoURL || user.user_metadata?.avatar_url || ""} className="h-8 w-8 rounded-full border border-white/25" alt="Avatar" referrerPolicy="no-referrer" /><span className="hidden max-w-[150px] truncate text-xs font-semibold text-white lg:block">{profile?.displayName || user.user_metadata?.full_name}</span></button><Button variant="ghost" size="sm" onClick={handleLogout} className="h-9 w-9 rounded-full p-0 text-white hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></Button></div></> : <Button onClick={login} className="h-10 rounded-full bg-[#E5D3B3] px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5D4037] hover:bg-white"><LogIn className="mr-2 h-4 w-4" />Ingresar</Button>}</div>
        <div className="flex items-center gap-2 md:hidden"><CartButton onClick={() => setIsCartOpen(true)} />{!user && <Button onClick={login} className="h-9 rounded-full bg-[#E5D3B3] px-4 text-[10px] font-bold uppercase tracking-widest text-[#5D4037] hover:bg-white">Ingresar</Button>}{user && <button onClick={() => setIsProfileModalOpen(true)}><img src={profile?.photoURL || user.user_metadata?.avatar_url || ""} className="h-9 w-9 rounded-full border border-[#E5D3B3]/40" alt="Avatar" referrerPolicy="no-referrer" /></button>}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}><SheetTrigger className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/15"><Menu className="h-5 w-5" /></SheetTrigger><SheetContent side="right" className="border-l-[#E5D3B3]/20 bg-[#5D4037] text-white" aria-describedby={undefined}><SheetTitle className="mt-4 flex items-center gap-2 font-serif text-2xl text-[#E5D3B3]"><Sparkles className="h-5 w-5" />Menu</SheetTitle><div className="mt-10 flex flex-col space-y-4"><Link to="/" onClick={handleHomeClick} className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/15">Inicio</Link><Link to="/servicios" onClick={() => setIsMenuOpen(false)} className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-bold uppercase tracking-widest text-white/85 transition hover:bg-white/15 hover:text-white">Servicios</Link>{isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="rounded-2xl bg-[#E5D3B3] px-5 py-4 text-sm font-bold uppercase tracking-widest text-[#5D4037]">Admin</Link>}{user && <PushNotificationButton mobile onComplete={() => setIsMenuOpen(false)} />}{user && <Button onClick={handleLogout} variant="outline" className="mt-4 w-full border-white/20 text-white hover:bg-white/10">Cerrar sesion</Button>}</div></SheetContent></Sheet>
        </div>
      </div>
    </nav>
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
  </>;
}

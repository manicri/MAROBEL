import { useState, useEffect } from "react";
import { Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Inicio", href: "#inicio" },
  { name: "Servicios", href: "#servicios" },
  { name: "Reservas", href: "#reservas" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-[#5D4037] py-2 shadow-lg" : "bg-black/40 py-4"
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2 text-white font-bold group">
          <div className="w-10 h-10 rounded-full border border-white/50 overflow-hidden bg-white/10">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="tracking-tighter">MAROBEL</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-xs uppercase tracking-widest text-white hover:text-[#E5D3B3] font-bold">
              {link.name}
            </a>
          ))}
          
          {isAdmin && (
            <a href="#admin" className="text-[10px] uppercase tracking-[0.4em] font-bold text-yellow-500 hover:text-yellow-400">Admin</a>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <img src={user.user_metadata?.avatar_url || ''} className="w-8 h-8 rounded-full" alt="Avatar" />
              <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:text-white hover:bg-white/10">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={login} className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full text-xs uppercase tracking-widest font-bold">
              <LogIn className="w-4 h-4 mr-2" /> Ingresar
            </Button>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
            <img src={user.user_metadata?.avatar_url || ''} className="w-8 h-8 rounded-full border border-[#E5D3B3]/30" alt="Avatar" />
          )}
          <Sheet>
            <SheetTrigger className="text-white p-2">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#5D4037] text-white">
              <SheetTitle className="text-[#E5D3B3] font-serif text-2xl flex items-center gap-2 mt-4">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" /> MAROBEL
              </SheetTitle>
              <div className="flex flex-col space-y-6 mt-10">
                {navLinks.map((link) => (
                  <a key={link.name} href={link.href} className="text-sm uppercase tracking-widest text-white/80 hover:text-white font-bold">
                    {link.name}
                  </a>
                ))}
                {isAdmin && <a href="#admin" className="text-sm uppercase tracking-widest text-yellow-500 font-bold">Admin</a>}
                {user ? (
                  <Button onClick={logout} variant="outline" className="w-full mt-4 border-white/20 text-white">
                    Cerrar Sesión
                  </Button>
                ) : (
                  <Button onClick={login} className="w-full bg-[#E5D3B3] text-[#5D4037] mt-4">Ingresar</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

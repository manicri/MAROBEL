import { useState, useEffect } from "react";
import { Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { name: "Inicio", href: "#inicio" },
  { name: "Servicios", href: "#servicios" },
  { name: "Reservas", href: "#reservas" },
] as const;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Ejecutar una vez al montar por si la página ya está scrolleada
    handleScroll();
    
    // Usar passive: true mejora el rendimiento del scroll en el navegador
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? "bg-[#5D4037]/95 backdrop-blur-md py-3 shadow-lg" 
          : "bg-gradient-to-b from-black/60 to-transparent py-5"
      }`}
      aria-label="Navegación principal"
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <a 
          href="#inicio" 
          className="group flex items-center gap-3 text-2xl font-serif font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5D3B3] rounded-lg"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <img 
              src="/logo.png" 
              alt="Logotipo de Marobel" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="tracking-tight drop-shadow-md">MAROBEL</span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-xs uppercase tracking-widest text-white/90 hover:text-[#E5D3B3] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5D3B3] rounded-sm px-1"
                >
                  {link.name}
                </a>
              </li>
            ))}
            {isAdmin && (
              <li>
                <a 
                  href="#admin" 
                  className="text-xs uppercase tracking-widest text-yellow-400 hover:text-yellow-300 font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-sm px-1"
                >
                  Admin
                </a>
              </li>
            )}
          </ul>

          {/* Desktop Auth */}
          <div className="pl-4 border-l border-white/20">
            {user ? (
              <div className="flex items-center gap-4">
                <img 
                  src={user.user_metadata?.avatar_url || ''} 
                  className="w-8 h-8 rounded-full border border-white/20 shadow-sm" 
                  alt={`Avatar de ${user.user_metadata?.full_name || 'usuario'}`} 
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className="text-white hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={login} 
                className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" /> Ingresar
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-3">
          {!user ? (
            <Button 
              onClick={login} 
              className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full h-8 px-4 text-[10px] uppercase tracking-widest font-bold transition-colors shadow-sm"
            >
              Ingresar
            </Button>
          ) : (
            <img 
              src={user.user_metadata?.avatar_url || ''} 
              className="w-8 h-8 rounded-full border border-[#E5D3B3]/30 shadow-sm" 
              alt="Avatar" 
            />
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-md transition-colors">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="bg-[#5D4037] text-white border-l-[#E5D3B3]/20 w-[300px] sm:w-[400px]"
              aria-describedby={undefined}
            >
              <SheetTitle className="text-[#E5D3B3] font-serif text-2xl flex items-center gap-3 mt-6 mb-8">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-[#E5D3B3]/30">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                MAROBEL
              </SheetTitle>
              
              <nav className="flex flex-col space-y-6" aria-label="Navegación móvil">
                {NAV_LINKS.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-sm uppercase tracking-widest text-white/80 hover:text-white font-bold transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {isAdmin && (
                  <a 
                    href="#admin" 
                    className="text-sm uppercase tracking-widest text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
                  >
                    Panel Admin
                  </a>
                )}
                
                <div className="pt-6 mt-6 border-t border-white/10">
                  {user ? (
                    <Button 
                      onClick={logout} 
                      variant="outline" 
                      className="w-full border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  ) : (
                    <Button 
                      onClick={login} 
                      className="w-full bg-[#E5D3B3] text-[#5D4037] hover:bg-white transition-colors font-bold uppercase tracking-widest text-xs"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Ingresar con Google
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

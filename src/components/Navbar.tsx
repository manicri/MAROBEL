import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { ProfileModal } from "./ProfileModal";
import { toast } from "sonner";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, profile, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    toast('¿Estás seguro de que deseas cerrar sesión?', {
      action: {
        label: 'Cerrar Sesión',
        onClick: async () => {
          await logout();
          toast.success('Sesión cerrada correctamente');
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#5D4037] py-3 shadow-xl" 
            : "bg-black/40 py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link 
            to="/" 
            onClick={handleHomeClick}
            className="text-2xl font-serif font-bold text-white flex items-center gap-3"
          >
            <img src="/logo.png" alt="Marobel Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
            MAROBEL
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              onClick={handleHomeClick}
              className="text-xs uppercase tracking-widest text-white hover:text-[#E5D3B3] font-bold transition-colors"
            >
              Inicio
            </Link>
            <a href="/#servicios" className="text-xs uppercase tracking-widest text-white hover:text-[#E5D3B3] font-bold transition-colors">
              Ver Servicios
            </a>
            
            {isAdmin && (
              <Link to="/admin" className="text-xs uppercase tracking-widest text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Admin</Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img src={profile?.photoURL || user.user_metadata?.avatar_url || ''} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-medium hidden lg:block">{profile?.displayName || user.user_metadata?.full_name}</span>
                </button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-white hover:bg-white/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={login} className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full text-xs uppercase tracking-widest font-bold transition-colors">
                <LogIn className="w-4 h-4 mr-2" /> Ingresar
              </Button>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-3">
            {!user && (
              <Button onClick={login} className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full h-8 px-4 text-[10px] uppercase tracking-widest font-bold transition-colors">
                Ingresar
              </Button>
            )}
            {user && (
              <button onClick={() => setIsProfileModalOpen(true)}>
                <img src={profile?.photoURL || user.user_metadata?.avatar_url || ''} className="w-8 h-8 rounded-full border border-[#E5D3B3]/30" alt="Avatar" referrerPolicy="no-referrer" />
              </button>
            )}
            <Sheet>
              <SheetTrigger className="text-white p-2 hover:bg-white/10 rounded-md transition-colors">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#5D4037] text-white border-l-[#E5D3B3]/20" aria-describedby={undefined}>
                <SheetTitle className="text-[#E5D3B3] font-serif text-2xl flex items-center gap-3 mt-4">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" referrerPolicy="no-referrer" /> MAROBEL
                </SheetTitle>
                <div className="flex flex-col space-y-6 mt-10">
                  <Link 
                    to="/" 
                    onClick={(e) => {
                      handleHomeClick(e);
                      // Close sheet is handled by the trigger usually, but here we might need to close it manually if it doesn't
                    }}
                    className="text-sm uppercase tracking-widest text-white/80 hover:text-white font-bold transition-colors"
                  >
                    Inicio
                  </Link>
                  <a href="/#servicios" className="text-sm uppercase tracking-widest text-white/80 hover:text-white font-bold transition-colors">
                    Ver Servicios
                  </a>
                  {isAdmin && <Link to="/admin" className="text-sm uppercase tracking-widest text-yellow-500 hover:text-yellow-400 font-bold transition-colors">Admin</Link>}
                  {user && (
                    <Button onClick={handleLogout} variant="outline" className="w-full mt-4 border-white/20 text-white hover:bg-white/10 transition-colors">
                      Cerrar Sesión
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Cambiado para asegurar compatibilidad
import { Menu, X, LogIn, LogOut, User as UserIcon, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const navLinks = [
  { name: "Inicio", href: "#inicio" },
  { name: "Servicios", href: "#servicios" },
  { name: "Reservas", href: "#reservas" },
];

function ProfileEditor() {
  const { profile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ displayName, phone });
      toast.success("Perfil actualizado exitosamente");
      setIsOpen(false);
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-white/60 hover:text-white hover:bg-white/5 p-2 rounded-md transition-colors">
        <Settings className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-[#5D4037]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[#5D4037]">Mi Perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <img 
              src={profile?.photoURL || ''} 
              className="w-16 h-16 rounded-full border-2 border-[#E5D3B3]/50" 
              alt="Avatar" 
            />
            <div>
              <p className="font-bold text-sm">{profile?.email}</p>
              <p className="text-xs text-[#5D4037]/60 uppercase tracking-widest font-bold">{profile?.role}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold text-[#5D4037]/70">Nombre</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-[#FAF9F6] border-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-xs uppercase tracking-widest font-bold text-[#5D4037]/70">Teléfono / WhatsApp</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#FAF9F6] border-none"
              placeholder="Ej. 0987654321"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#5D4037] text-white rounded-full px-8 uppercase tracking-widest text-xs font-bold"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? "bg-[#5D4037] py-3 shadow-2xl" 
          : "bg-gradient-to-b from-black/60 to-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a 
          href="#inicio" 
          className={`text-2xl font-serif font-bold tracking-tighter transition-all duration-500 flex items-center gap-2 ${
            isScrolled 
              ? "text-[#E5D3B3] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" 
              : "text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          }`}
        >
          {/* LOGO MEJORADO CON ANIMACIÓN */}
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 overflow-hidden ${
            isScrolled ? "border-[#E5D3B3] bg-[#5D4037]" : "border-white bg-black/20 backdrop-blur-md"
          }`}>
            <img 
              src="/logo.png" 
              alt="Marobel Logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=M'; }} 
            />
          </motion.div>
          <span className="hidden sm:inline">MAROBEL</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <motion.a
              whileHover={{ y: -2 }}
              key={link.name}
              href={link.href}
              className={`text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500 ${
                isScrolled ? "text-white/80 hover:text-[#E5D3B3]" : "text-white/90 hover:text-white"
              }`}
            >
              {link.name}
            </motion.a>
          ))}
          
          {isAdmin && (
            <a href="#admin" className="text-[10px] uppercase tracking-[0.4em] font-bold text-yellow-500 hover:text-yellow-400">Admin</a>
          )}

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Bell className="w-5 h-5 text-white/60 hover:text-white cursor-pointer transition-colors" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <img 
                    src={user.user_metadata?.avatar_url || ''} 
                    className="w-9 h-9 rounded-full border-2 border-[#E5D3B3]/30 shadow-lg" 
                    alt="Avatar" 
                  />
                  <ProfileEditor />
                  <Button variant="ghost" size="sm" onClick={logout} className="text-white/60 hover:text-white hover:bg-white/5 p-2">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                type="button"
                onClick={login} 
                className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full px-8 h-11 text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl transition-all hover:scale-105"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Ingresar
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-4">
          {user && (
             <img 
             src={user.user_metadata?.avatar_url || ''} 
             className="w-8 h-8 rounded-full border border-[#E5D3B3]/30" 
             alt="Avatar" 
           />
          )}
          <Sheet>
            <SheetTrigger className="text-white p-2 hover:bg-white/10 rounded-md transition-colors">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#5D4037] border-l-[#E5D3B3]/20 text-white">
              <SheetTitle className="text-[#E5D3B3] font-serif text-3xl mb-12 tracking-tighter flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Marobel Logo" 
                  className="w-10 h-10 object-contain" 
                />
                MAROBEL
              </SheetTitle>
              <div className="flex flex-col space-y-8 mt-10">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-bold uppercase tracking-[0.3em] text-white/70 hover:text-[#E5D3B3] transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {isAdmin && (
                  <a href="#admin" className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">Panel Admin</a>
                )}
                <div className="pt-8 border-t border-white/10">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                        <span className="text-xs uppercase tracking-widest font-bold">Mi Perfil</span>
                        <ProfileEditor />
                      </div>
                      <Button onClick={logout} variant="outline" className="w-full border-white/20 text-white rounded-full h-12 uppercase tracking-widest text-xs">Cerrar Sesión</Button>
                    </div>
                  ) : (
                    <Button type="button" onClick={login} className="w-full bg-[#E5D3B3] text-[#5D4037] rounded-full h-12 uppercase tracking-widest text-xs font-bold">Ingresar con Google</Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}

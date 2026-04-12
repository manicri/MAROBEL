import { useState, useEffect } from "react";
import { Menu, LogIn, LogOut, Bell, Settings } from "lucide-react";
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
      toast.success("Perfil actualizado");
      setIsOpen(false);
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-white/60 p-2 hover:text-white transition-colors">
        <Settings className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="bg-white text-[#5D4037]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#5D4037]">Mi Perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
            <Label>Nombre</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#5D4037] text-white">
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile, login, logout, isAdmin } = useAuth();

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
              <Button onClick={login} className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full text-xs uppercase tracking-widest font-bold">
                <LogIn className="w-4 h-4 mr-2" /> Ingresar
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-3">
          {!user && (
            <Button onClick={login} className="bg-[#E5D3B3] text-[#5D4037] hover:bg-white rounded-full h-8 px-3 text-[10px] uppercase tracking-widest font-bold">
              Ingresar
            </Button>
          )}
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
                {user && (
                  <Button onClick={logout} variant="outline" className="w-full mt-4 border-white/20 text-white">
                    Cerrar Sesión
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

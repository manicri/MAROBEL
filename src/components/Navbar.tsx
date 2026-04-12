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
      <DialogTrigger className="text-white/60 p-2"><Settings className="w-4 h-4" /></DialogTrigger>
      <DialogContent className="bg-white text-[#5D4037]">
        <DialogHeader><DialogTitle>Mi Perfil</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nombre" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
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
  const { user, login, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled ? "bg-[#5D4037] py-2" : "bg-black/40 py-4"}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#inicio" className="flex items-center gap-2 text-white font-bold">
          <div className="w-10 h-10 rounded-full border border-white overflow-hidden bg-white/10">
            {/* ESTA ES LA RUTA CLAVE */}
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span>MAROBEL</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-[10px] uppercase text-white hover:text-white/70">
              {link.name}
            </a>
          ))}
          {user ? (
            <Button onClick={logout} className="text-white text-xs">Salir</Button>
          ) : (
            <Button onClick={login} className="bg-white text-[#5D4037] rounded-full px-6 text-xs font-bold">Ingresar</Button>
          )}
        </div>

        <div className="md:hidden text-white">
          <Sheet>
            <SheetTrigger><Menu /></SheetTrigger>
            <SheetContent className="bg-[#5D4037] text-white">
              <SheetTitle className="flex items-center gap-2 text-white">
                <img src="/logo.png" className="w-8 h-8" alt="Logo" /> MAROBEL
              </SheetTitle>
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <a key={link.name} href={link.href} className="text-white uppercase">{link.name}</a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

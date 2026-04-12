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
      <DialogTrigger className="text-white/60 hover:text-white p-2">
        <Settings className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="bg-white text-[#5D4037]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#5D4037]">Mi Perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, login, logout

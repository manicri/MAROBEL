import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, login } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]"><p className="text-sm text-[#5D4037]/60">Verificando acceso...</p></div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-5"><div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#8D6E63]" /><h1 className="font-serif text-3xl text-[#5D4037]">Acceso administrativo</h1><p className="my-4 text-sm leading-relaxed text-[#5D4037]/60">Inicia sesión con una cuenta autorizada para administrar Marobel.</p><Button onClick={login} className="rounded-full bg-[#5D4037] px-7 text-white">Ingresar con Google</Button></div></div>;
  }

  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

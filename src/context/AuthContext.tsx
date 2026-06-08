import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export type AdminRole = "full" | "schedule" | null;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone?: string;
  role: "admin" | "client";
  adminRole: AdminRole;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: AdminRole;
  canManageServices: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; phone?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetProfile = async (currentUser: User) => {
    const fallbackName = currentUser.user_metadata?.full_name || "";
    let displayName = fallbackName;
    let phone = "";

    try {
      const [{ data: profileData }, { data: adminData, error: adminError }] = await Promise.all([
        supabase.from("users").select("display_name, phone").eq("id", currentUser.id).maybeSingle(),
        supabase.from("admins").select("user_id, role").eq("user_id", currentUser.id).maybeSingle(),
      ]);

      if (adminError) console.error("No se pudo comprobar el rol administrativo:", adminError);
      if (profileData) {
        displayName = profileData.display_name || fallbackName;
        phone = profileData.phone || "";
      } else {
        await supabase.from("users").upsert({ id: currentUser.id, email: currentUser.email, display_name: fallbackName });
      }

      const adminRole: AdminRole = adminData ? (adminData.role === "schedule" ? "schedule" : "full") : null;
      setProfile({
        uid: currentUser.id,
        email: currentUser.email || "",
        displayName,
        photoURL: currentUser.user_metadata?.avatar_url || "",
        phone,
        role: adminRole ? "admin" : "client",
        adminRole,
      });
    } catch (error) {
      console.error("No se pudo cargar el perfil:", error);
      setProfile({
        uid: currentUser.id,
        email: currentUser.email || "",
        displayName: fallbackName,
        photoURL: currentUser.user_metadata?.avatar_url || "",
        role: "client",
        adminRole: null,
      });
    }
  };

  const applySession = async (currentUser: User | null) => {
    setUser(currentUser);
    if (currentUser) await fetchAndSetProfile(currentUser);
    else setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "OAUTH_AUTH_SUCCESS") return;
      setLoading(true);
      supabase.auth.getSession().then(({ data: { session } }) => applySession(session?.user ?? null));
    };
    window.addEventListener("message", handleMessage);

    if (window.location.hash.includes("error=")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const description = params.get("error_description");
      if (description?.includes("Redirect URL not allowed")) {
        alert(`Debes agregar ${window.location.origin} a Redirect URLs en Supabase Authentication.`);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session?.user ?? null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (window.opener && window.opener !== window && session) {
        window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS" }, window.location.origin);
        setTimeout(() => window.close(), 500);
        return;
      }
      setLoading(true);
      applySession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) return;

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(data.url, "supabase_oauth", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const logout = async () => { await supabase.auth.signOut(); };

  const updateProfile = async (data: { displayName?: string; phone?: string; photoURL?: string }) => {
    if (!user) throw new Error("No user logged in");
    const updates: Record<string, string> = {};
    if (data.displayName !== undefined) updates.display_name = data.displayName;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (Object.keys(updates).length) {
      const { error } = await supabase.from("users").update(updates).eq("id", user.id);
      if (error) throw error;
    }

    const metadata: Record<string, string> = {};
    if (data.displayName !== undefined) metadata.full_name = data.displayName;
    if (data.photoURL !== undefined) metadata.avatar_url = data.photoURL;
    if (Object.keys(metadata).length) {
      const { error } = await supabase.auth.updateUser({ data: metadata });
      if (error) throw error;
    }
    setProfile((previous) => previous ? { ...previous, ...data } : null);
  };

  const adminRole = profile?.adminRole ?? null;
  return <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === "admin", adminRole, canManageServices: adminRole === "full", login, logout, updateProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

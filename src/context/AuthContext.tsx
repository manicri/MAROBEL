import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone?: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetProfile = async (currentUser: User) => {
    console.log('Iniciando fetchAndSetProfile para:', currentUser.email);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error de Supabase al buscar perfil:', error);
      }

      let displayName = currentUser.user_metadata?.full_name || '';
      let phone = '';

      if (data) {
        console.log('Perfil encontrado en BD');
        if (data.display_name) displayName = data.display_name;
        if (data.phone) phone = data.phone;
      } else {
        console.log('Perfil no encontrado, creando uno nuevo...');
        // Create initial record if it doesn't exist
        const { error: upsertError } = await supabase.from('users').upsert({
          id: currentUser.id,
          email: currentUser.email,
          display_name: displayName,
        });
        if (upsertError) console.error('Error al crear perfil inicial:', upsertError);
      }

      setProfile({
        uid: currentUser.id,
        email: currentUser.email || '',
        displayName,
        photoURL: currentUser.user_metadata?.avatar_url || '',
        phone,
        role: currentUser.email === 'crisdelrobbys@gmail.com' ? 'admin' : 'client',
      });
      console.log('Perfil establecido correctamente');
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback to metadata
      setProfile({
        uid: currentUser.id,
        email: currentUser.email || '',
        displayName: currentUser.user_metadata?.full_name || '',
        photoURL: currentUser.user_metadata?.avatar_url || '',
        role: currentUser.email === 'crisdelrobbys@gmail.com' ? 'admin' : 'client',
      });
    }
  };

  useEffect(() => {
    // Listen for OAuth success from popup
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from our own origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log('Mensaje de éxito OAuth recibido en ventana principal');
        setLoading(true);
        supabase.auth.getSession().then(({ data: { session } }) => {
          const currentUser = session?.user ?? null;
          console.log('Sesión recuperada tras popup:', currentUser?.email);
          setUser(currentUser);
          if (currentUser) {
            fetchAndSetProfile(currentUser).finally(() => {
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);

    // Check for errors in URL hash (e.g. Redirect URL not allowed)
    if (window.location.hash.includes('error=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = params.get('error_description');
      console.error('Auth error from URL:', errorDesc);
      // We can't use toast here directly if it's outside the Toaster context, but we can log it.
      // Actually, we can just alert it for debugging purposes so the user knows what's wrong.
      if (errorDesc?.includes('Redirect URL not allowed')) {
        alert('Error de Supabase: Debes agregar esta URL (' + window.location.origin + ') a la lista de "Redirect URLs" en la configuración de Authentication de Supabase.');
      }
    }

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchAndSetProfile(currentUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Evento de Auth detectado:', event, session?.user?.email);
      
      // Close popup if we are in one and authentication is complete
      if (window.opener && window.opener !== window && session) {
        console.log('Estamos en un popup, enviando mensaje de éxito y cerrando');
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, window.location.origin);
        // Pequeño retraso para asegurar que el mensaje se envíe antes de cerrar
        setTimeout(() => window.close(), 500);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchAndSetProfile(currentUser).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const login = async () => {
    console.log('Botón presionado - Iniciando OAuth en popup');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      }
    });
    
    if (error) {
      console.error('OAuth error:', error);
      return;
    }

    if (data?.url) {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        data.url,
        'supabase_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  };

  const logout = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cerrar sesión?')) return;
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: { displayName?: string; phone?: string }) => {
    if (!user) throw new Error('No user logged in');
    
    const updates = {
      id: user.id,
      ...(data.displayName !== undefined && { display_name: data.displayName }),
      ...(data.phone !== undefined && { phone: data.phone }),
    };

    const { error } = await supabase.from('users').upsert(updates);
    if (error) throw error;

    setProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin: profile?.role === 'admin',
      login, 
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

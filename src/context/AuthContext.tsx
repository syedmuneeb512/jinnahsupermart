import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isAdminLoading: false,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const roleCheckId = useRef(0);

  const checkAdminRole = async (userId: string) => {
    const currentCheck = ++roleCheckId.current;
    setIsAdmin(false);
    setIsAdminLoading(true);

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (roleCheckId.current !== currentCheck) return;
    setIsAdmin(!error && !!data);
    setIsAdminLoading(false);
  };

  const clearAdminState = () => {
    roleCheckId.current += 1;
    setIsAdmin(false);
    setIsAdminLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          void checkAdminRole(session.user.id);
        } else {
          clearAdminState();
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        void checkAdminRole(session.user.id);
      } else {
        clearAdminState();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAdminState();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAdmin,
        isAdminLoading,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

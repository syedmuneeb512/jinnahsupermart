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
  const checkedUserId = useRef<string | null>(null);

  const checkAdminRole = async (userId: string) => {
    if (checkedUserId.current === userId) return;
    checkedUserId.current = userId;
    const currentCheck = ++roleCheckId.current;
    setIsAdmin(false);
    setIsAdminLoading(true);

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleCheckId.current !== currentCheck) return;
    setIsAdmin(!error && !!data);
    if (error) checkedUserId.current = null;
    setIsAdminLoading(false);
  };

  const clearAdminState = () => {
    checkedUserId.current = null;
    roleCheckId.current += 1;
    setIsAdmin(false);
    setIsAdminLoading(false);
  };

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        authEventReceived = true;
        setSession(session);
        if (session?.user) {
          // Run database work after the auth callback releases its session lock.
          const userId = session.user.id;
          window.setTimeout(() => { if (active) void checkAdminRole(userId); }, 0);
        } else {
          clearAdminState();
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || authEventReceived) return;
      setSession(session);
      if (session?.user) {
        void checkAdminRole(session.user.id);
      } else {
        clearAdminState();
      }
      setIsLoading(false);
    });

    // The auth client refreshes expiring tokens automatically. getSession also
    // refreshes when necessary, without forcing a network request on every focus.
    const refreshSession = () => {
      void supabase.auth.getSession();
    };
    const interval = window.setInterval(refreshSession, 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSession();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      active = false;
      subscription.unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
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

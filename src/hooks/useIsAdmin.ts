import { useAuth } from "@/context/AuthContext";

export const useIsAdmin = () => {
  return useAuth().isAdmin;
};

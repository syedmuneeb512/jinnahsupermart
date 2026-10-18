import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { galleryQuery, ordersQuery, preloadStore, profileQuery } from "@/lib/storeQueries";

export default function StorePreloader() {
  const client = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    preloadStore(client);
    const channel = supabase.channel("store-cache-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        try { sessionStorage.removeItem("jsm_catalog_products"); } catch { /* Optional cache. */ }
        void client.invalidateQueries({ queryKey: ["store", "products"] });
        void client.invalidateQueries({ queryKey: ["store", "product"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        try { sessionStorage.removeItem("jsm_catalog_categories"); } catch { /* Optional cache. */ }
        void client.invalidateQueries({ queryKey: ["store", "categories"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => {
        try { sessionStorage.removeItem("jsm_catalog_settings"); } catch { /* Optional cache. */ }
        void client.invalidateQueries({ queryKey: ["store", "settings"] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [client]);

  useEffect(() => {
    if (!userId) return;
    void client.prefetchQuery(profileQuery(userId));
    void client.prefetchQuery(ordersQuery(userId));
    void client.prefetchQuery(galleryQuery());
    return () => { client.removeQueries({ queryKey: ["account", userId] }); };
  }, [client, userId]);

  return null;
}
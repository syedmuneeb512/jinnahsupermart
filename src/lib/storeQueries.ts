import { queryOptions, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Only public catalog information is persisted. Account data stays in memory.
function readPublicCache<T>(key: string): { data: T; updatedAt: number } | undefined {
  try {
    const raw = sessionStorage.getItem(`jsm_catalog_${key}`);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Date.now() - saved.updatedAt > 5 * 60 * 1000) return;
    return saved;
  } catch { return; }
}

function savePublicCache(key: string, data: unknown) {
  try { sessionStorage.setItem(`jsm_catalog_${key}`, JSON.stringify({ data, updatedAt: Date.now() })); } catch { /* Optional cache. */ }
}

export const productsQuery = () => {
  const cached = readPublicCache<Awaited<ReturnType<typeof loadProducts>>>("products");
  return queryOptions({ queryKey: ["store", "products"], queryFn: loadProducts, staleTime: 30_000, initialData: cached?.data, initialDataUpdatedAt: cached?.updatedAt });
};

async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  savePublicCache("products", data);
  return data;
}

export const categoriesQuery = () => {
  const cached = readPublicCache<Awaited<ReturnType<typeof loadCategories>>>("categories");
  return queryOptions({ queryKey: ["store", "categories"], queryFn: loadCategories, staleTime: 30_000, initialData: cached?.data, initialDataUpdatedAt: cached?.updatedAt });
};

async function loadCategories() {
  const { data, error } = await supabase.from("categories").select("id, name, icon, description").order("name");
  if (error) throw error;
  savePublicCache("categories", data);
  return data;
}

export const settingsQuery = () => {
  const cached = readPublicCache<Awaited<ReturnType<typeof loadSettings>>>("settings");
  return queryOptions({ queryKey: ["store", "settings"], queryFn: loadSettings, staleTime: 30_000, initialData: cached?.data, initialDataUpdatedAt: cached?.updatedAt });
};

async function loadSettings() {
  const { data, error } = await supabase.from("store_settings").select("key, value");
  if (error) throw error;
  savePublicCache("settings", data);
  return Object.fromEntries(data.map(row => [row.key, row.value])) as Record<string, string>;
}

export const profileQuery = (userId: string) => queryOptions({
  queryKey: ["account", userId, "profile"], staleTime: 30_000,
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("first_name, display_name, phone, address, avatar_url").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const ordersQuery = (userId: string) => queryOptions({
  queryKey: ["account", userId, "orders"], staleTime: 0,
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("id, status, total, created_at, shipping_address, city, order_items(quantity, price, product_id, products(name, image))").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const galleryQuery = () => queryOptions({
  queryKey: ["store", "gallery"], staleTime: 60_000,
  queryFn: async () => {
    const { data, error } = await supabase.storage.from("mart-gallery").list("", { limit: 5, sortBy: { column: "created_at", order: "asc" } });
    if (error) throw error;
    return data.map(file => supabase.storage.from("mart-gallery").getPublicUrl(file.name).data.publicUrl);
  },
});

export function preloadStore(client: QueryClient) {
  void client.prefetchQuery(productsQuery());
  void client.prefetchQuery(categoriesQuery());
  void client.prefetchQuery(settingsQuery());
}
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

const { from, rows } = vi.hoisted(() => ({
  from: vi.fn(),
  rows: [{ id: "product-1", name: "Dates", price: 150, stock: 10 }],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from, storage: { from: vi.fn() } },
}));

import { preloadStore, productsQuery, profileQuery } from "./storeQueries";

describe("storefront loading cache", () => {
  beforeEach(() => {
    sessionStorage.clear();
    from.mockReset();
    from.mockImplementation(() => {
      const builder: Record<string, unknown> = {};
      builder.select = () => builder;
      builder.eq = () => builder;
      builder.order = () => Promise.resolve({ data: rows, error: null });
      builder.maybeSingle = () => Promise.resolve({ data: { display_name: "Customer" }, error: null });
      builder.then = (resolve: (value: unknown) => void) => Promise.resolve({ data: [], error: null }).then(resolve);
      return builder;
    });
  });

  it("preloads products and shares one request across simultaneous page reads", async () => {
    const client = new QueryClient();
    preloadStore(client);
    const [home, categories] = await Promise.all([client.fetchQuery(productsQuery()), client.fetchQuery(productsQuery())]);
    expect(home).toEqual(rows);
    expect(categories).toEqual(rows);
    expect(from.mock.calls.filter(([table]) => table === "products")).toHaveLength(1);
  });

  it("renders cached catalog data immediately after a reload", async () => {
    await new QueryClient().fetchQuery(productsQuery());
    const client = new QueryClient();
    const options = productsQuery();
    expect(options.initialData).toEqual(rows);
    await client.fetchQuery(options);
    expect(from.mock.calls.filter(([table]) => table === "products")).toHaveLength(1);
  });

  it("does not restore expired catalog data", () => {
    sessionStorage.setItem("jsm_catalog_products", JSON.stringify({ data: rows, updatedAt: Date.now() - 6 * 60 * 1000 }));
    expect(productsQuery().initialData).toBeUndefined();
  });

  it("keeps each account's profile separate and never persists it", async () => {
    const client = new QueryClient();
    await client.fetchQuery(profileQuery("user-a"));
    expect(client.getQueryData(profileQuery("user-b").queryKey)).toBeUndefined();
    expect(sessionStorage.length).toBe(0);
  });
});
import { useState } from "react";
import { ArrowRight, Headphones, PackageCheck, ShoppingBasket, SlidersHorizontal, Truck, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Pencil } from "lucide-react";
import essentialsImage from "@/assets/home-essentials.jpg";
import storeLogo from "@/assets/logo-storefront.png";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/storeQueries";
import { toast } from "@/hooks/use-toast";

interface HomeSectionsProps {
  products: { id: string; name: string; price: number; image: string | null; stock: number }[];
}

type Item = { title: string; description: string };
interface HomeContent {
  essentials: { eyebrow: string; title: string; text: string; image: string; button: string; shelvesTitle: string; showShelves: boolean };
  features: { eyebrow: string; title: string; items: Item[] };
  faq: { eyebrow: string; title: string; items: Item[]; linkText: string };
  footer: { tagline: string; copyright: string };
}

const SETTINGS_KEY = "home_sections";
const icons = [ShoppingBasket, SlidersHorizontal, Truck, Headphones];

const defaults: HomeContent = {
  essentials: { eyebrow: "A little more for your everyday", title: "Your everyday essentials", text: "Stock the kitchen. Fill the pantry. Find your next favourite.", image: "", button: "Explore products", shelvesTitle: "From our shelves", showShelves: true },
  features: { eyebrow: "Click · Select · Deliver", title: "Shopping, made simple", items: [
    { title: "Everyday essentials", description: "Your grocery list, all in one place." },
    { title: "More choice", description: "Find the size or variant that suits you." },
    { title: "Home delivery", description: "From our store to your doorstep." },
    { title: "Here to help", description: "Get in touch with our store team." },
  ] },
  faq: { eyebrow: "Good to know", title: "Frequently asked questions", linkText: "Still have a question?", items: [
    { title: "How do I place an order?", description: "Choose your products, add them to your cart, and continue to checkout. Enter your delivery details and review your order before placing it." },
    { title: "Can I choose a different size or colour?", description: "For products with options, open the product page and select an available size, colour or variant. The picture and price reflect your selection." },
    { title: "Where can I see my orders?", description: "Open your Profile and select My Orders to view your orders and their latest status." },
    { title: "How can I contact the store?", description: "Visit our Contact page for the store's current contact details and available ways to reach our team." },
  ] },
  footer: { tagline: "Click · Select · Deliver", copyright: "Jinnah Super Mart" },
};

const parseContent = (raw?: string): HomeContent => {
  if (!raw) return defaults;
  try {
    const p = JSON.parse(raw);
    return {
      essentials: { ...defaults.essentials, ...p.essentials },
      features: { ...defaults.features, ...p.features },
      faq: { ...defaults.faq, ...p.faq },
      footer: { ...defaults.footer, ...p.footer },
    };
  } catch { return defaults; }
};

type SectionKey = keyof HomeContent;

const EditBtn = ({ onClick, light }: { onClick: () => void; light?: boolean }) => (
  <button type="button" aria-label="Edit section" onClick={onClick}
    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all ${light ? "bg-primary-foreground/20" : "bg-primary/10 hover:bg-primary/20"}`}>
    <Pencil size={14} className={light ? "text-primary-foreground" : "text-primary"} />
  </button>
);

const Field = ({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <label className="block space-y-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {multiline ? <Textarea value={value} onChange={e => onChange(e.target.value)} maxLength={600} /> : <Input value={value} onChange={e => onChange(e.target.value)} maxLength={200} />}
  </label>
);

const HomeSections = ({ products }: HomeSectionsProps) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(settingsQuery());
  const content = parseContent(settings?.[SETTINGS_KEY]);
  const [editing, setEditing] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<HomeContent>(content);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const open = (key: SectionKey) => { setDraft(content); setEditing(key); };
  const set = <K extends SectionKey>(key: K, patch: Partial<HomeContent[K]>) => setDraft(d => ({ ...d, [key]: { ...d[key], ...patch } }));

  const save = async () => {
    setSaving(true);
    const value = JSON.stringify(draft);
    const { data: updated, error } = await supabase.from("store_settings").update({ value }).eq("key", SETTINGS_KEY).select("id");
    let err = error;
    if (!err && (!updated || updated.length === 0)) {
      ({ error: err } = await supabase.from("store_settings").insert({ key: SETTINGS_KEY, value }));
    }
    setSaving(false);
    if (err) { toast({ title: "Error", description: "Could not save changes", variant: "destructive" }); return; }
    queryClient.setQueryData(settingsQuery().queryKey, (prev: Record<string, string> | undefined) => ({ ...prev, [SETTINGS_KEY]: value }));
    void queryClient.invalidateQueries({ queryKey: ["store", "settings"] });
    toast({ title: "Saved!", description: "Home page updated." });
    setEditing(null);
  };

  const uploadImage = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast({ title: "Invalid image", description: "Use JPG, PNG, WEBP or GIF under 5 MB", variant: "destructive" }); return;
    }
    setUploading(true);
    const path = `home/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    setUploading(false);
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    set("essentials", { image: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl });
  };

  const listEditor = (key: "features" | "faq", itemLabel: string, max: number) => (
    <div className="space-y-3">
      {draft[key].items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{itemLabel} {i + 1}</span>
            <button type="button" aria-label="Remove" onClick={() => set(key, { items: draft[key].items.filter((_, j) => j !== i) } as never)} className="text-destructive"><Trash2 size={15} /></button>
          </div>
          <Field label={key === "faq" ? "Question" : "Title"} value={item.title} onChange={v => set(key, { items: draft[key].items.map((it, j) => j === i ? { ...it, title: v } : it) } as never)} />
          <Field label={key === "faq" ? "Answer" : "Description"} multiline value={item.description} onChange={v => set(key, { items: draft[key].items.map((it, j) => j === i ? { ...it, description: v } : it) } as never)} />
        </div>
      ))}
      {draft[key].items.length < max && (
        <Button type="button" variant="outline" className="w-full" onClick={() => set(key, { items: [...draft[key].items, { title: "", description: "" }] } as never)}><Plus /> Add {itemLabel.toLowerCase()}</Button>
      )}
    </div>
  );

  const featuredProducts = products.filter(product => product.stock > 0 && product.image).slice(0, 2);
  const { essentials, features, faq, footer } = content;

  return (
    <div className="mt-5">
      <section aria-labelledby="essentials-heading" className="border-t border-border bg-card px-4 py-7">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-primary">{essentials.eyebrow}</p>
          {isAdmin && <EditBtn onClick={() => open("essentials")} />}
        </div>
        <h2 id="essentials-heading" className="mt-2 text-2xl font-bold text-foreground">{essentials.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{essentials.text}</p>
        <img src={essentials.image || essentialsImage} alt={essentials.title} loading="lazy" width={1024} height={768} className="mt-5 aspect-[4/3] w-full rounded-lg object-cover" />
        <Button asChild className="mt-4 w-full">
          <Link to="/categories">{essentials.button} <ArrowRight /></Link>
        </Button>

        {essentials.showShelves && featuredProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{essentials.shelvesTitle}</h3>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="group min-w-0 rounded-lg border border-border p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img src={product.image ?? ""} alt={product.name} loading="lazy" width={160} height={160} className="aspect-square w-full object-contain transition-transform motion-safe:group-hover:scale-105" />
                  <h4 className="mt-3 break-words text-sm font-semibold leading-snug text-foreground">{product.name}</h4>
                  <p className="mt-1 text-xs font-bold text-primary">PKR {product.price.toLocaleString()}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">View product <ArrowRight size={13} /></span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="features-heading" className="border-t border-border px-4 py-7">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-primary">{features.eyebrow}</p>
          {isAdmin && <EditBtn onClick={() => open("features")} />}
        </div>
        <h2 id="features-heading" className="mt-2 text-xl font-bold text-foreground">{features.title}</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6">
          {features.items.map(({ title, description }, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} className="min-w-0">
                <Icon size={25} strokeWidth={1.6} className="mb-3 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t border-border bg-card px-4 py-7">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-primary"><PackageCheck size={18} /><p className="text-xs font-semibold uppercase">{faq.eyebrow}</p></div>
          {isAdmin && <EditBtn onClick={() => open("faq")} />}
        </div>
        <h2 id="faq-heading" className="mt-2 text-xl font-bold text-foreground">{faq.title}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faq.items.map(({ title, description }, index) => (
            <AccordionItem value={`faq-${index}`} key={index}>
              <AccordionTrigger className="gap-3 text-left text-sm font-semibold">{title}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button asChild variant="link" className="mt-3 h-auto px-0">
          <Link to="/contact">{faq.linkText} <ArrowRight /></Link>
        </Button>
      </section>

      <footer className="bg-primary-dark px-4 py-7 text-primary-foreground">
        <div className="flex items-start justify-between gap-2">
          <Link to="/home" aria-label="Jinnah Super Mart home" className="inline-flex rounded-lg bg-card px-4 py-3">
            <img src={storeLogo} alt="Jinnah Super Mart" width={700} height={262} loading="lazy" className="h-9 w-auto sm:h-10" />
          </Link>
          {isAdmin && <EditBtn light onClick={() => open("footer")} />}
        </div>
        <p className="mt-2 text-xs text-primary-foreground/80">{footer.tagline}</p>
        <nav aria-label="Footer" className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[{ to: "/home", label: "Home" }, { to: "/categories", label: "Products" }, { to: "/cart", label: "My cart" }, { to: "/profile", label: "My account" }, { to: "/contact", label: "Contact us" }].map(link => (
            <Link key={link.to} to={link.to} className="w-fit text-primary-foreground/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-lighter">{link.label}</Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-primary-foreground/20 pt-4 text-xs text-primary-foreground/70">© {new Date().getFullYear()} {footer.copyright}</div>
      </footer>

      {isAdmin && (
        <Dialog open={editing !== null} onOpenChange={o => !o && setEditing(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing === "essentials" && "Edit essentials section"}
                {editing === "features" && "Edit features section"}
                {editing === "faq" && "Edit FAQ section"}
                {editing === "footer" && "Edit footer"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {editing === "essentials" && (<>
                <Field label="Small heading" value={draft.essentials.eyebrow} onChange={v => set("essentials", { eyebrow: v })} />
                <Field label="Title" value={draft.essentials.title} onChange={v => set("essentials", { title: v })} />
                <Field label="Text" multiline value={draft.essentials.text} onChange={v => set("essentials", { text: v })} />
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Picture</span>
                  <img src={draft.essentials.image || essentialsImage} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" disabled={uploading}>
                      <label className="cursor-pointer">{uploading ? "Uploading..." : "Change picture"}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void uploadImage(f); e.target.value = ""; }} />
                      </label>
                    </Button>
                    {draft.essentials.image && <Button variant="ghost" size="sm" onClick={() => set("essentials", { image: "" })}>Use default</Button>}
                  </div>
                </div>
                <Field label="Button text" value={draft.essentials.button} onChange={v => set("essentials", { button: v })} />
                <Field label="Featured products heading" value={draft.essentials.shelvesTitle} onChange={v => set("essentials", { shelvesTitle: v })} />
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={draft.essentials.showShelves} onChange={e => set("essentials", { showShelves: e.target.checked })} />
                  Show featured products
                </label>
              </>)}
              {editing === "features" && (<>
                <Field label="Small heading" value={draft.features.eyebrow} onChange={v => set("features", { eyebrow: v })} />
                <Field label="Title" value={draft.features.title} onChange={v => set("features", { title: v })} />
                {listEditor("features", "Feature", 8)}
              </>)}
              {editing === "faq" && (<>
                <Field label="Small heading" value={draft.faq.eyebrow} onChange={v => set("faq", { eyebrow: v })} />
                <Field label="Title" value={draft.faq.title} onChange={v => set("faq", { title: v })} />
                {listEditor("faq", "Question", 15)}
                <Field label="Contact link text" value={draft.faq.linkText} onChange={v => set("faq", { linkText: v })} />
              </>)}
              {editing === "footer" && (<>
                <Field label="Tagline" value={draft.footer.tagline} onChange={v => set("footer", { tagline: v })} />
                <Field label="Copyright name" value={draft.footer.copyright} onChange={v => set("footer", { copyright: v })} />
              </>)}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default HomeSections;

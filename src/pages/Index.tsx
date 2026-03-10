import { Search, Mic, ChevronRight, PhoneCall, Pencil, Check, Zap, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import AdminEditButton from "@/components/AdminEditButton";
import { useState, useEffect, useRef, useCallback } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import adminPanelIcon from "@/assets/admin-panel-icon.png";
import { toast } from "@/hooks/use-toast";

interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  description: string | null;
  rating: number | null;
  stock: number;
  category_id: string | null;
}

interface DbCategory {
  id: string;
  name: string;
  icon: string | null;
}

interface FlashSaleData {
  id: string;
  title: string;
  description: string | null;
  end_time: string | null;
  items: {
    product: DbProduct;
    discount_type: string;
    discount_value: number;
    sale_price: number;
  }[];
}

interface BannerData {
  title: string;
  subtitle: string;
  button: string;
}

const defaultBanners: BannerData[] = [
  { title: "Jinnah Super Mart", subtitle: "Quality products\nat best prices", button: "Shop Now" },
  { title: "Grocery Deals", subtitle: "Up to 30% OFF\non daily essentials", button: "Shop Now" },
  { title: "Electronics Sale", subtitle: "Save up to PKR 20,000\non gadgets", button: "Shop Now" },
  { title: "Free Delivery", subtitle: "On orders above\nPKR 2,000", button: "Order Now" },
];

const bannerStyles = [
  { className: "gradient-banner", icon: "ShoppingCart" },
  { style: { background: "linear-gradient(135deg, hsl(140 60% 38%), hsl(160 70% 42%))" }, icon: "ShoppingBasket" },
  { style: { background: "linear-gradient(135deg, hsl(340 80% 55%), hsl(10 90% 60%))" }, icon: "Smartphone" },
  { style: { background: "linear-gradient(135deg, hsl(260 60% 50%), hsl(280 70% 55%))" }, icon: "Truck" },
];

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon size={24} /> : null;
};

const BannerIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon size={80} className="text-primary-foreground" /> : null;
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice search not supported", description: "Your browser doesn't support voice search.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening]);
  const [firstName, setFirstName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannerData[]>(defaultBanners);
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [countdown, setCountdown] = useState("");
  const [editingBanner, setEditingBanner] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<BannerData>({ title: "", subtitle: "", button: "" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data?.first_name) {
        setFirstName(data.first_name);
      } else if (data?.display_name) {
        const name = data.display_name.split(" ")[0];
        setFirstName(name.includes("@") ? "" : name);
      }
      setAvatarUrl(data?.avatar_url || null);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchShopData = async () => {
      const [prodRes, catRes, settingsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, icon").order("name"),
        supabase.from("store_settings").select("key, value"),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);

      if (settingsRes.data) {
        const settings = Object.fromEntries(settingsRes.data.map(s => [s.key, s.value]));
        const loaded = defaultBanners.map((def, i) => ({
          title: settings[`banner_${i}_title`] || def.title,
          subtitle: settings[`banner_${i}_subtitle`] || def.subtitle,
          button: settings[`banner_${i}_button`] || def.button,
        }));
        setBanners(loaded);
      }
    };
    fetchShopData();
  }, []);

  const startEditBanner = (index: number) => {
    setEditingBanner(index);
    setEditValues({ ...banners[index] });
  };

  const saveBanner = async (index: number) => {
    const keys = [
      { key: `banner_${index}_title`, value: editValues.title },
      { key: `banner_${index}_subtitle`, value: editValues.subtitle },
      { key: `banner_${index}_button`, value: editValues.button },
    ];

    for (const item of keys) {
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("key", item.key)
        .maybeSingle();

      if (existing) {
        await supabase.from("store_settings").update({ value: item.value }).eq("key", item.key);
      } else {
        await supabase.from("store_settings").insert({ key: item.key, value: item.value });
      }
    }

    const updated = [...banners];
    updated[index] = { ...editValues };
    setBanners(updated);
    setEditingBanner(null);
    toast({ title: "Banner updated!" });
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-sm sm:text-base font-semibold text-foreground leading-tight break-words">
              Welcome, {firstName || "there"}!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                title="Admin Panel"
                className="px-2.5 sm:px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] sm:text-xs font-semibold whitespace-nowrap hover:opacity-90 active:scale-95 transition-all"
              >
                Manage
              </button>
            )}
            <button onClick={() => navigate("/contact")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
              <PhoneCall size={17} className="text-primary-foreground" />
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-brand flex items-center justify-center">
                  <Icons.User size={18} className="text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-2.5 shadow-card">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button onClick={startVoiceSearch} className="p-1 rounded-full transition-colors" type="button">
            <Mic size={18} className={isListening ? "text-red-500 animate-pulse" : "text-muted-foreground"} />
          </button>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {banners.map((banner, i) => {
            const style = bannerStyles[i] || bannerStyles[0];
            const isEditing = editingBanner === i;

            return (
              <div
                key={i}
                className={`rounded-xl p-5 relative overflow-hidden min-w-[85%] snap-start ${style.className || ""}`}
                style={style.style}
              >
                <div className="relative z-10">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={editValues.title}
                        onChange={(e) => setEditValues(v => ({ ...v, title: e.target.value }))}
                        className="w-full bg-white/20 rounded px-2 py-1 text-lg font-extrabold text-primary-foreground placeholder:text-primary-foreground/50 outline-none"
                        placeholder="Title"
                      />
                      <textarea
                        value={editValues.subtitle}
                        onChange={(e) => setEditValues(v => ({ ...v, subtitle: e.target.value }))}
                        className="w-full bg-white/20 rounded px-2 py-1 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none resize-none"
                        placeholder="Subtitle"
                        rows={2}
                      />
                      <input
                        value={editValues.button}
                        onChange={(e) => setEditValues(v => ({ ...v, button: e.target.value }))}
                        className="w-full bg-white/20 rounded px-2 py-1 text-xs font-bold text-primary-foreground placeholder:text-primary-foreground/50 outline-none"
                        placeholder="Button text"
                      />
                      <button
                        onClick={() => saveBanner(i)}
                        className="mt-1 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1"
                      >
                        <Check size={14} /> Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-extrabold text-primary-foreground">{banner.title}</h2>
                      <p className="text-sm text-primary-foreground/90 mt-1 whitespace-pre-line">
                        {banner.subtitle}
                      </p>
                      <button
                        onClick={() => navigate("/categories")}
                        className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                      >
                        {banner.button} <ChevronRight size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Admin edit pencil */}
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => startEditBanner(i)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all"
                  >
                    <Pencil size={14} className="text-primary-foreground" />
                  </button>
                )}

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                  <BannerIcon iconName={style.icon} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">Categories</span>
          {isAdmin && <AdminEditButton to="/admin/categories" label="Edit Categories" />}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex flex-col items-center gap-1.5 min-w-[60px] group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !selectedCategory ? "gradient-brand text-primary-foreground" : "bg-primary/10 text-primary group-hover:gradient-brand group-hover:text-primary-foreground"
            }`}>
              <CategoryIcon iconName="LayoutGrid" />
            </div>
            <span className="text-[11px] font-medium text-foreground">All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 min-w-[60px] group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                selectedCategory === cat.id ? "gradient-brand text-primary-foreground" : "bg-primary/10 text-primary group-hover:gradient-brand group-hover:text-primary-foreground"
              }`}>
                <CategoryIcon iconName={cat.icon || "Tag"} />
              </div>
              <span className="text-[11px] font-medium text-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "All Products"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
            {isAdmin && <AdminEditButton to="/admin/products" label="Edit Products" />}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products found</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;

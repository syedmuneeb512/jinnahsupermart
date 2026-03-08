import { Search, Mic, ChevronRight, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon size={24} /> : null;
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();

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
      const [prodRes, catRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, icon").order("name"),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    };
    fetchShopData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">
              Welcome, {firstName || "there"}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/923106522033" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
              <Icons.MessageCircle size={18} className="text-primary-foreground" />
            </a>
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center">
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
          <Mic size={18} className="text-muted-foreground" />
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {/* Card 1 - JSmart */}
          <div className="gradient-banner rounded-xl p-5 relative overflow-hidden min-w-[85%] snap-start">
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-primary-foreground">JSmart Store</h2>
              <p className="text-sm text-primary-foreground/90 mt-1">
                Quality products<br />at best prices
              </p>
              <button className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
                Shop Now <ChevronRight size={14} />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <Icons.ShoppingCart size={80} className="text-primary-foreground" />
            </div>
          </div>

          {/* Card 2 - Grocery Deals */}
          <div className="rounded-xl p-5 relative overflow-hidden min-w-[85%] snap-start" style={{ background: "linear-gradient(135deg, hsl(140 60% 38%), hsl(160 70% 42%))" }}>
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-primary-foreground">Grocery Deals</h2>
              <p className="text-sm text-primary-foreground/90 mt-1">
                Up to 30% OFF<br />on daily essentials
              </p>
              <button className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
                Shop Now <ChevronRight size={14} />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <Icons.ShoppingBasket size={80} className="text-primary-foreground" />
            </div>
          </div>

          {/* Card 3 - Electronics Sale */}
          <div className="rounded-xl p-5 relative overflow-hidden min-w-[85%] snap-start" style={{ background: "linear-gradient(135deg, hsl(340 80% 55%), hsl(10 90% 60%))" }}>
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-primary-foreground">Electronics Sale</h2>
              <p className="text-sm text-primary-foreground/90 mt-1">
                Save up to PKR 20,000<br />on gadgets
              </p>
              <button className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
                Shop Now <ChevronRight size={14} />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <Icons.Smartphone size={80} className="text-primary-foreground" />
            </div>
          </div>

          {/* Card 4 - Free Delivery */}
          <div className="rounded-xl p-5 relative overflow-hidden min-w-[85%] snap-start" style={{ background: "linear-gradient(135deg, hsl(260 60% 50%), hsl(280 70% 55%))" }}>
            <div className="relative z-10">
              <h2 className="text-xl font-extrabold text-primary-foreground">Free Delivery</h2>
              <p className="text-sm text-primary-foreground/90 mt-1">
                On orders above<br />PKR 2,000
              </p>
              <button className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
                Order Now <ChevronRight size={14} />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <Icons.Truck size={80} className="text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2">
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
          <span className="text-xs text-muted-foreground">{filtered.length} items</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products found</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;

import { Search, Mic, ChevronRight } from "lucide-react";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon size={24} /> : null;
};

const Index = () => {
  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, display_name")
        .eq("user_id", user.id)
        .single();
      if (data?.first_name) {
        setFirstName(data.first_name);
      } else if (data?.display_name) {
        setFirstName(data.display_name.split(" ")[0]);
      }
    };
    fetchName();
  }, [user]);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

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
            <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center">
              <Icons.User size={18} className="text-primary-foreground" />
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

      {/* Banner */}
      <div className="px-4 py-3">
        <div className="gradient-banner rounded-xl p-5 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-extrabold text-primary-foreground">Big Sale!</h2>
            <p className="text-sm text-primary-foreground/90 mt-1">
              Get 50% OFF<br />on electronics
            </p>
            <button className="mt-3 bg-card text-primary text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
              Shop Now <ChevronRight size={14} />
            </button>
          </div>
          <img
            src="/images/sale-banner.png"
            alt="Sale"
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 mix-blend-overlay"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-1.5 min-w-[60px] group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:gradient-brand group-hover:text-primary-foreground transition-all">
                <CategoryIcon iconName={cat.icon} />
              </div>
              <span className="text-[11px] font-medium text-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Products */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Popular Products</h2>
          <ChevronRight size={20} className="text-muted-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;

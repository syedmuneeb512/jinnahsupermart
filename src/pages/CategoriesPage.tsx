import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import AdminEditButton from "@/components/AdminEditButton";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import * as Icons from "lucide-react";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface Product {
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

const CategoryIcon = ({ iconName }: { iconName: string }) => {
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon size={24} /> : null;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const fetch = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name, icon, description").order("name"),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setProducts(prodRes.data);
    };
    fetch();
  }, []);

  const filtered = selectedId
    ? products.filter((p) => p.category_id === selectedId)
    : products;

  const selectedCat = categories.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <div className="px-4 pt-6 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate("/home")} className="p-1 shrink-0">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground truncate">Categories</h1>
        </div>
        {isAdmin && (
          <div className="shrink-0">
            <AdminEditButton to="/admin/categories" label="Edit Categories" />
          </div>
        )}
      </div>

      {/* Category grid */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(selectedId === cat.id ? null : cat.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                selectedId === cat.id
                  ? "gradient-brand text-primary-foreground"
                  : "bg-primary/10 text-primary group-hover:gradient-brand group-hover:text-primary-foreground"
              }`}>
                <CategoryIcon iconName={cat.icon || "Tag"} />
              </div>
              <span className="text-[11px] font-medium text-foreground text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-base font-bold text-foreground truncate pr-2">
            {selectedCat ? selectedCat.name : "All Products"}
          </h2>
          <span className="text-xs text-muted-foreground shrink-0">{filtered.length} items</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products in this category</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CategoriesPage;

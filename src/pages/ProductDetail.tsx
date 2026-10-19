import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Star, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import ProductCard from "@/components/ProductCard";
import AdminEditButton from "@/components/AdminEditButton";
import Seo from "@/components/Seo";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productsQuery } from "@/lib/storeQueries";

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

interface Variant {
  id: string;
  label: string; // e.g. "Mango" or "Red"
  size?: string; // e.g. "350ml"
  price: number;
  original_price?: number | null;
  image?: string | null;
  stock?: number;
}

interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  description: string | null;
  rating: number | null;
  stock: number;
  images?: string[] | null;
  variants?: Variant[] | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const queryClient = useQueryClient();
  const { data: product, isPending: loading } = useQuery<DbProduct | null>({
    queryKey: ["store", "product", id],
    enabled: !!id,
    staleTime: 30_000,
    initialData: () => queryClient.getQueryData(productsQuery().queryKey)?.find(item => item.id === id) as unknown as DbProduct | undefined,
    initialDataUpdatedAt: () => queryClient.getQueryState(productsQuery().queryKey)?.dataUpdatedAt,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id ?? "").maybeSingle();
      if (error) throw error;
      return data as unknown as DbProduct | null;
    },
  });
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    setQuantity(1);
    setActiveImageIdx(0);
    setSelectedVariantId(null);
  }, [id]);

  // Normalize gallery & variants (with demo fallbacks so the UI is meaningful even before data is filled in)
  const variants = useMemo<Variant[]>(() => {
    if (!product) return [];
    const raw = Array.isArray(product.variants) ? product.variants : [];
    return raw.filter((v) => v && v.id);
  }, [product]);

  const gallery = useMemo<string[]>(() => {
    if (!product) return [];
    const base = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const variantImgs = variants.map((v) => v.image).filter(Boolean) as string[];
    const all = [...base, ...variantImgs];
    if (all.length === 0 && product.image) all.push(product.image);
    // dedupe preserving order
    return Array.from(new Set(all));
  }, [product, variants]);

  // Group variants by label (flavor/color/type) and by size for two-row chips
  const labels = useMemo(() => Array.from(new Set(variants.map((v) => v.label).filter(Boolean))), [variants]);
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size).filter(Boolean) as string[])), [variants]);

  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;

  // When variant changes, swap main image if variant has one
  useEffect(() => {
    if (selectedVariant?.image) {
      const idx = gallery.indexOf(selectedVariant.image);
      if (idx >= 0) setActiveImageIdx(idx);
    }
  }, [selectedVariant, gallery]);

  const { data: allProducts } = useQuery(productsQuery());
  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    const others = allProducts.filter((p) => p.id !== product.id);
    const catId = (product as unknown as { category_id?: string | null }).category_id;
    const same = catId ? others.filter((p) => p.category_id === catId) : [];
    const rest = others.filter((p) => !same.includes(p));
    return [...same, ...rest].slice(0, 8);
  }, [product, allProducts]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-foreground">Product not found</div>;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginal = selectedVariant?.original_price ?? product.original_price;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const mainImage = gallery[activeImageIdx] ?? selectedVariant?.image ?? product.image;

  const pickVariantByLabelSize = (label?: string, size?: string) => {
    const match = variants.find(
      (v) => (label ? v.label === label : true) && (size ? v.size === size : true)
    );
    if (match) setSelectedVariantId(match.id);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: selectedVariant ? `${product.id}::${selectedVariant.id}` : product.id,
      productId: product.id,
      name: selectedVariant
        ? `${product.name}${selectedVariant.label ? " - " + selectedVariant.label : ""}${selectedVariant.size ? " (" + selectedVariant.size + ")" : ""}`
        : product.name,
      price: displayPrice,
      image: mainImage,
      description: product.description,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
      size: selectedVariant?.size,
    };
    for (let i = 0; i < quantity; i++) addToCart(cartItem);
    toast.success(`${cartItem.name} added to cart`);
  };

  const discountPct =
    displayOriginal && displayOriginal > displayPrice
      ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md md:max-w-6xl mx-auto">
      <Seo
        title={`${product.name} | Jinnah Super Mart`}
        description={(product.description || `Buy ${product.name} online at Jinnah Super Mart with fast home delivery and everyday low prices.`).slice(0, 155)}
        path={`/product/${product.id}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: product.image || undefined,
          description: product.description || undefined,
          offers: {
            "@type": "Offer",
            price: displayPrice,
            priceCurrency: "PKR",
            availability: displayStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `https://jsm01.lovable.app/product/${product.id}`,
          },
        }}
      />
      {/* Header */}
      <div className="flex items-center gap-2 px-4 md:px-6 pt-6 pb-2">
        <button aria-label="Go back" onClick={() => navigate(-1)} className="p-1 shrink-0">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-foreground truncate flex-1">{product.name}</h1>
        <div className="flex items-center gap-1 shrink-0">
          {isAdmin && <AdminEditButton to="/admin/products" label="Edit Product" />}
          <button aria-label="More options" className="p-1">
            <MoreVertical size={22} className="text-foreground" />
          </button>
        </div>
      </div>

      {/* Responsive two-column layout on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-8 md:px-6">

      {/* Main Image */}
      <div className="px-4 md:px-0 py-2">
        <div className="relative bg-card rounded-2xl p-6 shadow-card flex items-center justify-center aspect-square animate-scale-in overflow-hidden">
          {mainImage ? (
            <img
              key={mainImage}
              src={mainImage}
              alt={product.name}
              className="w-4/5 h-4/5 object-contain animate-fade-in"
            />
          ) : (
            <div className="text-muted-foreground">No Image</div>
          )}
          {discountPct > 0 && (
            <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="px-4 md:px-0 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {gallery.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImageIdx(i)}
                className={cn(
                  "w-16 h-16 shrink-0 rounded-lg border-2 bg-card p-1 transition-all",
                  activeImageIdx === i ? "border-primary scale-105" : "border-border opacity-70"
                )}
              >
                <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="px-4 md:px-0 py-3 animate-slide-up">
        <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
        {selectedVariant && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedVariant.label}
            {selectedVariant.size ? ` · ${selectedVariant.size}` : ""}
          </p>
        )}
        {product.rating != null && (
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < (product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-muted"}
              />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2 mt-3">
          <p className="text-2xl font-extrabold text-primary">{formatPrice(displayPrice)}</p>
          {displayOriginal && displayOriginal > displayPrice && (
            <p className="text-sm text-muted-foreground line-through mb-1">
              {formatPrice(displayOriginal)}
            </p>
          )}
        </div>

        {/* Variant: Flavor / Color / Type */}
        {labels.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Flavor / Color: <span className="text-foreground">{selectedVariant?.label}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const active = selectedVariant?.label === label;
                return (
                  <button
                    key={label}
                    onClick={() => pickVariantByLabelSize(label, selectedVariant?.size)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all active:scale-95",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant: Size */}
        {sizes.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Size: <span className="text-foreground">{selectedVariant?.size}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const active = selectedVariant?.size === size;
                return (
                  <button
                    key={size}
                    onClick={() => pickVariantByLabelSize(selectedVariant?.label, size)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all active:scale-95",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between mt-5">
          <span className="text-sm font-semibold text-foreground">Quantity</span>
          <div className="flex items-center gap-3 bg-card rounded-lg border border-border">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-primary hover:bg-muted rounded-l-lg transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold w-6 text-center">{quantity}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-primary hover:bg-muted rounded-r-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleAddToCart}
            disabled={displayStock <= 0}
            className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            onClick={() => {
              handleAddToCart();
              navigate("/cart");
            }}
            disabled={displayStock <= 0}
            className="flex-1 py-3 rounded-xl gradient-brand text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-5">
            <h3 className="text-sm font-bold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Stock */}
        <div className="mt-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            displayStock > 10 ? "bg-green-100 text-green-700" :
            displayStock > 0 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>

      </div>{/* /grid */}

      {related.length > 0 && (
        <section className="px-4 md:px-6 mt-8 mb-4" aria-labelledby="related-heading">
          <h3 id="related-heading" className="text-base font-bold text-foreground mb-3">Related Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} isAdmin={isAdmin} />
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
};

export default ProductDetail;

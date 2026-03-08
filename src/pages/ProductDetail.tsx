import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Star, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

interface DbProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string | null;
  description: string | null;
  rating: number | null;
  stock: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      setProduct(data);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-foreground">Product not found</div>;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">{product.name}</h1>
        <button className="p-1">
          <MoreVertical size={22} className="text-foreground" />
        </button>
      </div>

      {/* Product Image */}
      <div className="px-4 py-2">
        <div className="relative bg-card rounded-2xl p-6 shadow-card flex items-center justify-center aspect-square animate-scale-in">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-4/5 h-4/5 object-contain" />
          ) : (
            <div className="text-muted-foreground">No Image</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3 animate-slide-up">
        <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
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

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xl font-extrabold text-foreground">{formatPrice(product.price)}</p>
            {product.original_price && (
              <p className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</p>
            )}
          </div>
          <div className="flex items-center gap-3 bg-card rounded-lg border border-border">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-primary hover:bg-muted rounded-l-lg transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold w-6 text-center">{quantity}</span>
            <button
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
            className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all"
          >
            Add to Cart
          </button>
          <button
            onClick={() => {
              handleAddToCart();
              navigate("/cart");
            }}
            className="flex-1 py-3 rounded-xl gradient-brand text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
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
            product.stock > 10 ? "bg-green-100 text-green-700" :
            product.stock > 0 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductDetail;

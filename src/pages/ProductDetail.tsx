import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreVertical, Star, Minus, Plus } from "lucide-react";
import { products, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === Number(id));
  if (!product) return <div className="p-8 text-center">Product not found</div>;

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
          {product.badge && (
            <span className="absolute top-4 left-4 gradient-brand text-primary-foreground text-xs font-bold px-3 py-1 rounded-lg">
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-4/5 h-4/5 object-contain"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3 animate-slide-up">
        <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-extrabold text-foreground">{formatPrice(product.price)}</p>
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
        <div className="mt-5">
          <h3 className="text-sm font-bold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductDetail;

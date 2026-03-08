import { Star, Pencil } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    price: number;
    image: string | null;
    rating?: number | null;
    description?: string | null;
    original_price?: number | null;
    stock?: number;
    category?: string;
    badge?: string;
  };
  isAdmin?: boolean;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const ProductCard = ({ product, isAdmin }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div
      className="bg-card rounded-lg shadow-card p-3 flex flex-col cursor-pointer animate-fade-in active:scale-[0.97] transition-transform relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/admin/products");
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-90 transition-all"
        >
          <Pencil size={12} className="text-primary" />
        </button>
      )}
      <div className="relative bg-secondary rounded-lg p-4 mb-2 flex items-center justify-center aspect-square overflow-hidden">
        {product.badge && (
          <span className="absolute top-2 left-2 gradient-brand text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
            {product.badge}
          </span>
        )}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
      <p className="text-xs font-bold text-primary mt-0.5">{formatPrice(product.price)}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product as any);
          toast.success(`${product.name} added to cart`);
        }}
        className="mt-2 text-xs font-semibold gradient-brand text-primary-foreground py-1.5 rounded-md hover:opacity-90 active:scale-95 transition-all"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

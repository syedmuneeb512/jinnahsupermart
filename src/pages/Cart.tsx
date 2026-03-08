import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, totalItems, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Shopping Cart</h1>
        <div className="relative p-1">
          <ShoppingCart size={22} className="text-primary" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 gradient-brand text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="px-4 py-2 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 gradient-brand text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card animate-fade-in"
            >
              <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0 p-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {product.name}
                </h3>
                <p className="text-sm font-extrabold text-primary mt-0.5">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm font-extrabold text-primary mt-0.5">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-muted rounded-lg">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1.5 text-foreground hover:text-primary transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-1.5 text-foreground hover:text-primary transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total & Checkout */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border px-4 py-3">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total:</span>
              <span className="text-lg font-extrabold text-foreground">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full gradient-brand text-primary-foreground font-bold text-sm py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Cart;

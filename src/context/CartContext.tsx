import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartProduct {
  /** Unique cart key. For variant items: `${productId}::${variantId}`. Otherwise the product UUID. */
  id: string | number;
  /** Real DB product UUID (used for order_items). Falls back to `id` if not set. */
  productId?: string;
  name: string;
  price: number;
  image: string | null;
  description?: string | null;
  variantId?: string;
  variantLabel?: string;
  size?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: CartProduct) => {
    setItems((prev) => {
      const existing = prev.find((i) => String(i.product.id) === String(product.id));
      if (existing) {
        return prev.map((i) =>
          String(i.product.id) === String(product.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string | number) => {
    setItems((prev) => prev.filter((i) => String(i.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (String(i.product.id) === String(productId) ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

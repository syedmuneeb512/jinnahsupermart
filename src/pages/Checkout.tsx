import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, CreditCard, CheckCircle2, Package } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Pre-fill from profile
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("phone, address")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPhone(data.phone || "");
            setAddress(data.address || "");
          }
        });
    }
  }, [user]);

  // Redirect if cart empty and no order placed
  useEffect(() => {
    if (!authLoading && items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [items, authLoading, orderPlaced, navigate]);

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!phone.trim() || !address.trim()) {
      toast({ title: "Missing info", description: "Please enter phone and address.", variant: "destructive" });
      return;
    }

    setPlacing(true);
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          phone: phone.trim(),
          shipping_address: address.trim(),
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError || !order) throw orderError || new Error("Failed to create order");

      // 2. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: String(item.product.id), // static product id as string for now
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Update profile with latest phone/address
      await supabase
        .from("profiles")
        .update({ phone: phone.trim(), address: address.trim() })
        .eq("user_id", user.id);

      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      toast({ title: "Order failed", description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Order Placed!</h1>
          <p className="text-sm text-muted-foreground">
            Your order has been placed successfully. We'll deliver it to your address soon.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Order ID: {orderId.slice(0, 8)}
          </p>
          <Button
            onClick={() => navigate("/home")}
            className="w-full gradient-brand text-primary-foreground"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/cart")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Order Summary</h2>
          </div>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground truncate flex-1 mr-2">
                {product.name} × {quantity}
              </span>
              <span className="text-muted-foreground font-semibold whitespace-nowrap">
                {formatPrice(product.price * quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Total ({totalItems} items)
            </span>
            <span className="text-base font-extrabold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="px-4 space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          Delivery Information
        </h2>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="pl-10"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full gradient-brand text-primary-foreground py-6 text-sm font-bold"
          >
            <CreditCard size={18} className="mr-2" />
            {placing ? "Placing Order..." : `Place Order — ${formatPrice(totalPrice)}`}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Cash on Delivery • Free Shipping
        </p>
      </div>
    </div>
  );
};

export default Checkout;

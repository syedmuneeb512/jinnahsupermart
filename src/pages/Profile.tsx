import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogOut, User, Phone, MapPin, Save, Camera, Package, ChevronDown, ChevronUp, Store, Plus, Trash2, Pencil, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";

interface OrderWithItems {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: string | null;
  city: string | null;
  order_items: {
    quantity: number;
    price: number;
    product_id: string;
    products: { name: string; image: string | null } | null;
  }[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "⏳ Pending", variant: "secondary" },
  confirmed: { label: "✅ Confirmed", variant: "default" },
  processing: { label: "📦 Processing", variant: "default" },
  shipped: { label: "🚚 Shipped", variant: "default" },
  delivered: { label: "✔️ Delivered", variant: "default" },
  cancelled: { label: "❌ Cancelled", variant: "destructive" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return <Badge variant={config.variant} className="text-[10px] px-2 py-0.5">{config.label}</Badge>;
};

const Profile = () => {
  const { user, isLoading, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [martOwner, setMartOwner] = useState("");
  const [martLocation, setMartLocation] = useState("");
  const [editingMartInfo, setEditingMartInfo] = useState(false);
  const [savingMartInfo, setSavingMartInfo] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Fetch orders
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        const { data } = await supabase
          .from("orders")
          .select("id, status, total, created_at, shipping_address, city, order_items(quantity, price, product_id, products(name, image))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) {
          setOrders(data as unknown as OrderWithItems[]);
        }
        setLoadingOrders(false);
      };
      fetchOrders();

      // Realtime subscription for order status updates
      const channel = supabase
        .channel('user-orders')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: (payload.new as any).status } : o));
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, phone, address, avatar_url")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setDisplayName(data.display_name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setAvatarUrl(data.avatar_url || null);
        }
        setLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [user]);

  // Fetch mart gallery images
  const fetchGallery = async () => {
    setLoadingGallery(true);
    const { data } = await supabase.storage.from("mart-gallery").list("", { limit: 5, sortBy: { column: "created_at", order: "asc" } });
    if (data) {
      const urls = data.map((file) => {
        const { data: urlData } = supabase.storage.from("mart-gallery").getPublicUrl(file.name);
        return urlData.publicUrl;
      });
      setGalleryImages(urls);
    }
    setLoadingGallery(false);
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryImages.length >= 5) {
      toast({ title: "Limit reached", description: "Maximum 5 images allowed.", variant: "destructive" });
      return;
    }
    setUploadingGallery(true);
    const fileName = `mart-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("mart-gallery").upload(fileName, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Image uploaded!" });
      await fetchGallery();
    }
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleGalleryDelete = async (url: string) => {
    const fileName = url.split("/").pop();
    if (!fileName) return;
    const { error } = await supabase.storage.from("mart-gallery").remove([fileName]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Image deleted!" });
      await fetchGallery();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated!" });
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone, address })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/home")} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-foreground">My Profile</h1>
      </div>

      {/* Avatar section */}
      <div className="flex flex-col items-center py-4">
        <div
          className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-brand flex items-center justify-center">
              <User size={36} className="text-primary-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-primary mt-2 hover:underline"
        >
          Change Photo
        </button>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
      </div>

      {/* Form */}
      <div className="px-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Full Name</Label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your delivery address"
              className="pl-10"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-brand text-primary-foreground"
        >
          <Save size={16} className="mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      {/* My Orders Section */}
      <div className="px-4 mt-8">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <Package size={20} />
          My Orders
        </h2>
        {loadingOrders ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">You haven't placed any orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} className="border border-border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}Rs. {order.total.toLocaleString()}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
                      {order.city && <p className="text-xs text-muted-foreground">📍 {order.city}{order.shipping_address ? `, ${order.shipping_address}` : ""}</p>}
                      <div className="space-y-2">
                        {order.order_items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {item.products?.image && (
                              <img src={item.products.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.products?.name || "Product"}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity} · Rs. {item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* About Mart Gallery */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Store size={20} />
            About Mart
          </h2>
          {isAdmin && galleryImages.length < 5 && (
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground"
            >
              {uploadingGallery ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <Plus size={18} />
              )}
            </button>
          )}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </div>

        {loadingGallery ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No mart photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {galleryImages.map((url, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square bg-muted">
                <img src={url} alt={`Mart photo ${idx + 1}`} className="w-full h-full object-cover" />
                {isAdmin && (
                  <button
                    onClick={() => handleGalleryDelete(url)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 flex items-center justify-center text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mart Info */}
        <div className="mt-4 bg-card rounded-xl p-4 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <User size={15} className="text-primary" />
            <span className="font-semibold">Owner:</span>
            <span className="text-muted-foreground">Muhammad Muneeb</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-foreground">
            <MapPin size={15} className="text-primary mt-0.5" />
            <span className="font-semibold">Location:</span>
            <span className="text-muted-foreground">Jinnah Super Mart, Main Bazar, Pakistan</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  image: string | null;
  images: any;
  variants: any;
  stock: number;
  rating: number | null;
  created_at: string;
}

interface Variant {
  id: string;
  label: string;      // e.g. flavor / color / type
  size: string;       // e.g. 180ml, Small, 1kg
  price: string;
  original_price: string;
  stock: string;
  image: string;      // optional variant image url
}

interface Category {
  id: string;
  name: string;
}

const MIN_IMAGES = 4;
const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const defaultForm = { name: "", description: "", price: "", original_price: "", category_id: "", stock: "" };
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    if (prodRes.data) setProducts(prodRes.data as any);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getCategoryName = (catId: string | null) => {
    if (!catId) return "—";
    return categories.find((c) => c.id === catId)?.name || "—";
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setImageUrls([]);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      category_id: p.category_id || "",
      stock: String(p.stock),
    });
    const existing = Array.isArray(p.images) ? (p.images as string[]) : [];
    const merged = existing.length ? existing : (p.image ? [p.image] : []);
    setImageUrls(merged);
    setDialogOpen(true);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Image upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const f of files) {
      const url = await uploadFile(f);
      if (url) uploaded.push(url);
    }
    setImageUrls((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast({ title: "Name and price are required", variant: "destructive" });
      return;
    }
    if (imageUrls.length < MIN_IMAGES) {
      toast({
        title: `At least ${MIN_IMAGES} images required`,
        description: `Please upload ${MIN_IMAGES - imageUrls.length} more image(s).`,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category_id: form.category_id || null,
      stock: Number(form.stock) || 0,
      image: imageUrls[0],
      images: imageUrls,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast({ title: "Error updating product", description: error.message, variant: "destructive" });
      else toast({ title: "Product updated" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast({ title: "Error creating product", description: error.message, variant: "destructive" });
      else toast({ title: "Product created" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    else { toast({ title: "Product deleted" }); fetchData(); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Button onClick={openCreate} className="gradient-brand text-primary-foreground gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No products yet. Add your first one!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Image</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Stock</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                        <td className="py-3 px-4 text-foreground">{getCategoryName(product.category_id)}</td>
                        <td className="py-3 px-4 text-foreground">{formatPrice(product.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10 ? "bg-green-100 text-green-700" :
                            product.stock > 0 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                              <Pencil size={14} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Price (PKR) *</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Original Price</label>
                <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="For sale display" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Stock</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Product Images * <span className="text-muted-foreground font-normal">(min {MIN_IMAGES})</span>
                </label>
                <span className={`text-xs font-semibold ${imageUrls.length >= MIN_IMAGES ? "text-green-600" : "text-destructive"}`}>
                  {imageUrls.length} / {MIN_IMAGES}+
                </span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={url + idx} className="relative group aspect-square">
                    <img src={url} alt={`img-${idx}`} className="w-full h-full rounded-lg object-cover bg-muted border border-border" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-lg text-xs text-muted-foreground hover:bg-muted hover:border-primary transition-colors">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={18} /><span>Add</span></>}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesSelect} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">First image is the main thumbnail. You can select multiple files at once.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || uploading} className="gradient-brand text-primary-foreground gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Products;

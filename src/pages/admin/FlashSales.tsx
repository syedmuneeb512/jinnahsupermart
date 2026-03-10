import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Zap, Package, Clock, Edit2 } from "lucide-react";
import { format } from "date-fns";

interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

interface FlashSaleItem {
  id: string;
  flash_sale_id: string;
  product_id: string;
  discount_type: string;
  discount_value: number;
  product?: { name: string; price: number; image: string | null };
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

const FlashSales = () => {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSale, setSelectedSale] = useState<FlashSale | null>(null);
  const [saleItems, setSaleItems] = useState<FlashSaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [form, setForm] = useState({ title: "", description: "", start_time: "", end_time: "" });

  // Add product dialog
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedSale) fetchSaleItems(selectedSale.id);
  }, [selectedSale]);

  const fetchSales = async () => {
    const { data } = await supabase.from("flash_sales").select("*").order("created_at", { ascending: false });
    setSales(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, price, image");
    setProducts(data || []);
  };

  const fetchSaleItems = async (saleId: string) => {
    const { data } = await supabase
      .from("flash_sale_items")
      .select("*, product:products(name, price, image)")
      .eq("flash_sale_id", saleId);
    setSaleItems((data as any) || []);
  };

  const openCreate = () => {
    setEditingSale(null);
    setForm({ title: "", description: "", start_time: "", end_time: "" });
    setDialogOpen(true);
  };

  const openEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setForm({
      title: sale.title,
      description: sale.description || "",
      start_time: sale.start_time ? sale.start_time.slice(0, 16) : "",
      end_time: sale.end_time ? sale.end_time.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const saveSale = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }

    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
    };

    if (editingSale) {
      const { error } = await supabase.from("flash_sales").update(payload).eq("id", editingSale.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Flash sale updated!");
    } else {
      const { error } = await supabase.from("flash_sales").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Flash sale created!");
    }
    setDialogOpen(false);
    fetchSales();
  };

  const toggleActive = async (sale: FlashSale) => {
    await supabase.from("flash_sales").update({ is_active: !sale.is_active }).eq("id", sale.id);
    fetchSales();
    if (selectedSale?.id === sale.id) setSelectedSale({ ...sale, is_active: !sale.is_active });
    toast.success(sale.is_active ? "Flash sale deactivated" : "Flash sale activated!");
  };

  const deleteSale = async (id: string) => {
    await supabase.from("flash_sales").delete().eq("id", id);
    if (selectedSale?.id === id) { setSelectedSale(null); setSaleItems([]); }
    fetchSales();
    toast.success("Flash sale deleted");
  };

  const addProduct = async () => {
    if (!selectedSale || !selectedProductId || !discountValue) {
      toast.error("Select a product and enter discount"); return;
    }
    const { error } = await supabase.from("flash_sale_items").insert({
      flash_sale_id: selectedSale.id,
      product_id: selectedProductId,
      discount_type: discountType,
      discount_value: Number(discountValue),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Product added to flash sale!");
    setAddProductOpen(false);
    setSelectedProductId("");
    setDiscountValue("");
    fetchSaleItems(selectedSale.id);
  };

  const removeItem = async (itemId: string) => {
    await supabase.from("flash_sale_items").delete().eq("id", itemId);
    if (selectedSale) fetchSaleItems(selectedSale.id);
    toast.success("Product removed");
  };

  const getSalePrice = (item: FlashSaleItem) => {
    if (!item.product) return 0;
    if (item.discount_type === "percentage") {
      return Math.round(item.product.price * (1 - item.discount_value / 100));
    }
    return item.discount_value;
  };

  const isCurrentlyActive = (sale: FlashSale) => {
    if (!sale.is_active) return false;
    const now = new Date();
    if (sale.start_time && new Date(sale.start_time) > now) return false;
    if (sale.end_time && new Date(sale.end_time) < now) return false;
    return true;
  };

  const existingProductIds = saleItems.map(i => i.product_id);
  const availableProducts = products.filter(p => !existingProductIds.includes(p.id));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Zap className="text-primary" size={28} /> Flash Sales
        </h1>
        <Button onClick={openCreate} className="gradient-brand text-primary-foreground">
          <Plus size={16} className="mr-1" /> New Flash Sale
        </Button>
      </div>

      {/* Sales List */}
      <div className="grid gap-3 mb-8">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No flash sales yet. Create one!</p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className={`bg-card rounded-xl p-4 shadow-card cursor-pointer border-2 transition-all ${
                selectedSale?.id === sale.id ? "border-primary" : "border-transparent hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">{sale.title}</h3>
                    {isCurrentlyActive(sale) ? (
                      <Badge className="bg-green-500/10 text-green-600 text-[10px]">LIVE</Badge>
                    ) : sale.is_active ? (
                      <Badge variant="secondary" className="text-[10px]">Scheduled</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  {sale.description && (
                    <p className="text-xs text-muted-foreground truncate">{sale.description}</p>
                  )}
                  {(sale.start_time || sale.end_time) && (
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {sale.start_time && format(new Date(sale.start_time), "MMM d, h:mm a")}
                      {sale.start_time && sale.end_time && " — "}
                      {sale.end_time && format(new Date(sale.end_time), "MMM d, h:mm a")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={sale.is_active}
                    onCheckedChange={() => toggleActive(sale)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(sale); }}>
                    <Edit2 size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteSale(sale.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Sale Items */}
      {selectedSale && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Products in "{selectedSale.title}"
            </h2>
            <Button size="sm" onClick={() => setAddProductOpen(true)} className="gradient-brand text-primary-foreground">
              <Plus size={14} className="mr-1" /> Add Product
            </Button>
          </div>

          {saleItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No products added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product?.name || "—"}</TableCell>
                      <TableCell>PKR {item.product?.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        {item.discount_type === "percentage"
                          ? `${item.discount_value}% off`
                          : `PKR ${item.discount_value.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="font-bold text-primary">PKR {getSalePrice(item).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSale ? "Edit Flash Sale" : "Create Flash Sale"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Eid Special Sale" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="datetime-local" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Leave times empty for manual on/off control only.</p>
            <Button onClick={saveSale} className="w-full gradient-brand text-primary-foreground">
              {editingSale ? "Update" : "Create"} Flash Sale
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Flash Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {availableProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — PKR {p.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Sale Price (PKR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{discountType === "percentage" ? "Discount %" : "Sale Price (PKR)"}</Label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 450"}
              />
            </div>
            <Button onClick={addProduct} className="w-full gradient-brand text-primary-foreground">
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashSales;

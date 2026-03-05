import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { products, formatPrice } from "@/data/products";
import { Plus, Pencil, Trash2 } from "lucide-react";

const Products = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog</p>
          </div>
          <Button className="gradient-brand text-primary-foreground gap-2">
            <Plus size={18} /> Add Product
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Image</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                      <td className="py-3 px-4 text-foreground">{product.category}</td>
                      <td className="py-3 px-4 text-foreground">{formatPrice(product.price)}</td>
                      <td className="py-3 px-4 text-foreground">⭐ {product.rating}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Products;

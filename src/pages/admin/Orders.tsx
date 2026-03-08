import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Orders = () => {
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!inner(display_name, first_name, last_name),
          order_items(id, quantity, price, products(name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage customer orders</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading orders...</p>
            ) : !orders?.length ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Phone</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Items</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const profile = order.profiles as any;
                      const customerName = profile?.display_name || 
                        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || 
                        "Unknown";
                      const itemCount = (order.order_items as any[])?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

                      return (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">{customerName}</td>
                          <td className="py-3 px-4 text-muted-foreground">{order.phone || "-"}</td>
                          <td className="py-3 px-4 text-foreground">{itemCount}</td>
                          <td className="py-3 px-4 text-foreground font-medium">PKR {Number(order.total).toLocaleString()}</td>
                          <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <Select defaultValue={order.status} onValueChange={(val) => updateStatus(order.id, val)}>
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Orders;

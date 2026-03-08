import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast as sonnerToast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at, user_id"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

      return {
        revenue: totalRevenue,
        orders: orders.length,
        products: productsRes.count || 0,
        customers: profilesRes.count || 0,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`*, order_items(id, quantity, price, product_id, products(name))`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!ordersData?.length) return [];

      const userIds = [...new Set(ordersData.map((o) => o.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, first_name, last_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      return ordersData.map((o) => {
        const p = profileMap.get(o.user_id);
        const items = (o.order_items as any[]) || [];
        return {
          ...o,
          customer: p?.display_name || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Unknown",
          productNames: items.map((i: any) => `${i.products?.name || "Unknown"} ×${i.quantity}`).join(", "),
          itemCount: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
        };
      });
    },
  });

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      sonnerToast.error("Failed to update status");
    } else {
      sonnerToast.success("Status updated");
      refetchOrders();
    }
  };

  const statCards = [
    { label: "Total Revenue", value: `PKR ${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Total Orders", value: String(stats?.orders || 0), icon: ShoppingCart },
    { label: "Products", value: String(stats?.products || 0), icon: Package },
    { label: "Customers", value: String(stats?.customers || 0), icon: Users },
  ];

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to JSM admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentOrders?.length ? (
              <p className="text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{order.customer}</td>
                        <td className="py-3 px-4 text-foreground">PKR {Number(order.total).toLocaleString()}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
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
    </AdminLayout>
  );
};

export default Dashboard;

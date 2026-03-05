import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "PKR 1,245,000", icon: DollarSign, trend: "+12%" },
  { label: "Total Orders", value: "342", icon: ShoppingCart, trend: "+8%" },
  { label: "Products", value: "24", icon: Package, trend: "+3" },
  { label: "Customers", value: "1,892", icon: Users, trend: "+156" },
];

const recentOrders = [
  { id: "ORD-001", customer: "Ahmed Khan", total: "PKR 219,999", status: "Delivered" },
  { id: "ORD-002", customer: "Sara Ali", total: "PKR 14,499", status: "Processing" },
  { id: "ORD-003", customer: "Usman Tariq", total: "PKR 104,999", status: "Shipped" },
  { id: "ORD-004", customer: "Fatima Noor", total: "PKR 9,999", status: "Pending" },
];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to JSmart admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => (
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
                <div className="flex items-center gap-1 mt-3 text-xs">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-green-500 font-semibold">{stat.trend}</span>
                  <span className="text-muted-foreground">vs last month</span>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{order.id}</td>
                      <td className="py-3 px-4 text-foreground">{order.customer}</td>
                      <td className="py-3 px-4 text-foreground">{order.total}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Delivered" ? "bg-green-100 text-green-700" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                          order.status === "Processing" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {order.status}
                        </span>
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

export default Dashboard;

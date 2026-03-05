import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const orders = [
  { id: "ORD-001", customer: "Ahmed Khan", email: "ahmed@mail.com", total: "PKR 219,999", items: 1, status: "Delivered", date: "2026-03-01" },
  { id: "ORD-002", customer: "Sara Ali", email: "sara@mail.com", total: "PKR 14,499", items: 1, status: "Processing", date: "2026-03-02" },
  { id: "ORD-003", customer: "Usman Tariq", email: "usman@mail.com", total: "PKR 104,999", items: 2, status: "Shipped", date: "2026-03-03" },
  { id: "ORD-004", customer: "Fatima Noor", email: "fatima@mail.com", total: "PKR 9,999", items: 1, status: "Pending", date: "2026-03-04" },
  { id: "ORD-005", customer: "Bilal Shah", email: "bilal@mail.com", total: "PKR 234,498", items: 3, status: "Delivered", date: "2026-03-04" },
];

const Orders = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage customer orders</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Order ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Items</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{order.id}</td>
                      <td className="py-3 px-4 text-foreground">{order.customer}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.email}</td>
                      <td className="py-3 px-4 text-foreground">{order.items}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{order.total}</td>
                      <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
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
                      <td className="py-3 px-4">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Eye size={14} />
                        </Button>
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

export default Orders;

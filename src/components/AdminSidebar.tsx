import { BarChart3, Package, ShoppingCart, Users, LogOut, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const links = [
    { label: "Dashboard", icon: BarChart3, path: "/admin" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { label: "Users", icon: Users, path: "/admin/users" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-extrabold text-foreground">JSmart Admin</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Management Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "gradient-brand text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button
          onClick={() => navigate("/home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <Home size={18} />
          Back to Store
        </button>
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

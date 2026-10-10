import { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={22} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary">JSM Admin Panel</h1>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <button
            aria-label="Go back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/home"))}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

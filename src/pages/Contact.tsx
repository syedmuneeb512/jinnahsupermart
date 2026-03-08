import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, Clock, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";

interface SettingsMap {
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
}

const defaultSettings: SettingsMap = {
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  working_hours: "",
};

const Contact = () => {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [settings, setSettings] = useState<SettingsMap>(defaultSettings);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("store_settings").select("key, value");
      if (data) {
        const map: any = { ...defaultSettings };
        data.forEach((row: any) => { map[row.key] = row.value; });
        setSettings(map);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const startEdit = (key: string, value: string) => {
    setEditing(key);
    setEditValue(value);
  };

  const saveEdit = async (key: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const { error } = await supabase
      .from("store_settings")
      .update({ value: trimmed })
      .eq("key", key);
    if (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } else {
      setSettings((prev) => ({ ...prev, [key]: trimmed }));
      toast({ title: "Updated!", description: `${key} has been updated.` });
    }
    setEditing(null);
  };

  const whatsappNum = settings.whatsapp.replace(/[^0-9]/g, "");

  const contactItems = [
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, iconBg: "bg-[hsl(142,70%,45%)]", iconColor: "text-primary-foreground", href: `https://wa.me/${whatsappNum}?text=${encodeURIComponent("Hello Jinnah Super Mart! I need help.")}` },
    { key: "phone", label: "Call Us", icon: Phone, iconBg: "bg-primary", iconColor: "text-primary-foreground", href: `tel:${settings.phone}` },
    { key: "email", label: "Email", icon: Mail, iconBg: "bg-accent", iconColor: "text-accent-foreground", href: `mailto:${settings.email}` },
    { key: "address", label: "Address", icon: MapPin, iconBg: "bg-secondary", iconColor: "text-secondary-foreground" },
    { key: "working_hours", label: "Working Hours", icon: Clock, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-8">
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-card">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Contact Us</h1>
        {isAdmin && <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Admin</span>}
      </div>

      <div className="px-4 py-4">
        <div className="gradient-banner rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-extrabold text-primary-foreground">Jinnah Super Mart</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">JSM Customer Service</p>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {contactItems.map((item) => {
          const IconComp = item.icon;
          const isEditing = editing === item.key;
          const value = settings[item.key as keyof SettingsMap];

          const content = (
            <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-md transition-all w-full">
              <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                <IconComp size={22} className={item.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{item.label}</p>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 text-sm bg-background border border-input rounded-md px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      maxLength={200}
                    />
                    <button onClick={() => saveEdit(item.key)} className="text-primary"><Check size={18} /></button>
                    <button onClick={() => setEditing(null)} className="text-muted-foreground"><X size={18} /></button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground truncate">{value}</p>
                )}
              </div>
              {isAdmin && !isEditing && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(item.key, value); }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 hover:bg-accent transition-colors"
                >
                  <Pencil size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>
          );

          if (item.href && !isEditing) {
            return (
              <a key={item.key} href={item.href} target={item.key === "whatsapp" ? "_blank" : undefined} rel="noopener noreferrer" className="block active:scale-[0.98] transition-transform">
                {content}
              </a>
            );
          }
          return <div key={item.key}>{content}</div>;
        })}
      </div>
    </div>
  );
};

export default Contact;

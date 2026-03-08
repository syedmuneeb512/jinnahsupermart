import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-card">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Contact Us</h1>
      </div>

      {/* Store Info */}
      <div className="px-4 py-4">
        <div className="gradient-banner rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-extrabold text-primary-foreground">JSmart Store</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">We're here to help you!</p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="px-4 space-y-3">
        {/* WhatsApp */}
        <a
          href="https://wa.me/923106522033"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center shrink-0">
            <MessageCircle size={22} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground">+92 310 6522033</p>
          </div>
        </a>

        {/* Phone */}
        <a
          href="tel:+923106522033"
          className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Phone size={22} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Call Us</p>
            <p className="text-sm text-muted-foreground">+92 310 6522033</p>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:jsmart.store@gmail.com"
          className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Mail size={22} className="text-accent-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Email</p>
            <p className="text-sm text-muted-foreground">jsmart.store@gmail.com</p>
          </div>
        </a>

        {/* Address */}
        <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <MapPin size={22} className="text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Address</p>
            <p className="text-sm text-muted-foreground">Jinnah Super Market, Islamabad</p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Clock size={22} className="text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Working Hours</p>
            <p className="text-sm text-muted-foreground">Mon - Sat: 10:00 AM - 10:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

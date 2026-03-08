import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminEditButtonProps {
  to: string;
  label?: string;
  className?: string;
}

const AdminEditButton = ({ to, label, className = "" }: AdminEditButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(to);
      }}
      title={label || "Edit"}
      className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:bg-primary/20 active:scale-90 transition-all ${className}`}
    >
      <Pencil size={14} className="text-primary" />
    </button>
  );
};

export default AdminEditButton;

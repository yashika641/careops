import { motion } from "motion/react";
import { Phone, Calendar } from "lucide-react";
import { Lead } from "../../types";
import { StatusBadge } from "../ui/status-badge";

interface LeadCardProps {
  lead: Lead;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LeadCard({ lead, isSelected = false, onClick }: LeadCardProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "new":
        return "new";
      case "contacted":
        return "contacted";
      case "qualified":
        return "qualified";
      case "booked":
        return "booked";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-card border rounded-2xl p-6 cursor-pointer transition-all shadow-sm hover:shadow-md ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{lead.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{lead.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={getStatusVariant(lead.status)}>
            {lead.status}
          </StatusBadge>
          <span className="text-xs text-muted-foreground">
            {formatTime(lead.timestamp)}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium">
          {lead.serviceType}
        </span>
      </div>

      <p className="text-sm text-foreground line-clamp-2">{lead.message}</p>

      {lead.preferredDate && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            Preferred:{" "}
            {new Date(lead.preferredDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </motion.div>
  );
}

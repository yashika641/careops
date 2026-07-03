import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconColor?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = "text-primary",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 0.98 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-[0px_6px_20px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <p className="text-4xl font-semibold text-foreground mb-2">{value}</p>
      {trend && (
        <div
          className={`flex items-center gap-1 text-sm ${
            trend.positive ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{trend.value}</span>
        </div>
      )}
    </motion.div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        new: "bg-blue-100 text-blue-700 border-blue-200",
        contacted: "bg-purple-100 text-purple-700 border-purple-200",
        qualified: "bg-amber-100 text-amber-700 border-amber-200",
        booked: "bg-green-100 text-green-700 border-green-200",
        good: "text-green-600 bg-green-50 border-green-200",
        low: "text-amber-600 bg-amber-50 border-amber-200",
        out: "text-red-600 bg-red-50 border-red-200",
        default: "bg-gray-100 text-gray-700 border-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode;
}

function StatusBadge({ className, variant, icon, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </div>
  );
}

export { StatusBadge, statusBadgeVariants };

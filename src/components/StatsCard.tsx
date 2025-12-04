import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  reverseColor?: boolean; // ✅ for color logic
  className?: string;
}

/**
 * Maps card title → explanation for tooltip
 */
const formulaHints: Record<string, string> = {
  "Total Balance": "💡 Total Balance = Sum of all category budgets",
  "Expenses": "💡 Expenses = Total spent this month across all subcategories",
  "Avg Daily Spendings": "💡 Average = Total expenses ÷ Days elapsed this month",
  "Savings": "💡 Savings = Total Balance - Expenses",
};

export const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  reverseColor = false,
  className,
}: StatsCardProps) => {
  // Base colors
  const baseTrendColors = {
    up: "text-success", // green
    down: "text-destructive", // red
    neutral: "text-muted-foreground",
  };

  // Reverse colors for Balance / Savings
  const trendColors = reverseColor
    ? {
        up: baseTrendColors.down,
        down: baseTrendColors.up,
        neutral: baseTrendColors.neutral,
      }
    : baseTrendColors;

  const tooltipMessage =
    formulaHints[title] || "💡 This value is calculated based on your activity";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "p-6 hover:shadow-medium transition-all duration-300 animate-scale-in cursor-help",
              "bg-gradient-card border-border/50",
              className
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>

                {change && (
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-medium flex items-center gap-1",
                      trendColors[trend]
                    )}
                  >
                    <span>{change}</span>
                    <span className="text-xs sm:text-sm font-medium">
                      from last month
                    </span>
                  </p>
                )}
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </TooltipTrigger>

        {/* Tooltip content */}
        <TooltipContent side="bottom" align="center" className="text-sm max-w-[240px]">
          {tooltipMessage}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

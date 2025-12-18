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
  reverseColor?: boolean;
  className?: string;
}

/** Tooltip text for each card */
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
  const baseTrendColors = {
    up: "text-[#6bc000]",           // green
    down: "text-[#ff5f5f]",         // red
    neutral: "text-gray-400",
  };

  // Reverse colors for balance/savings
  const trendColors = reverseColor
    ? {
        up: baseTrendColors.down,
        down: baseTrendColors.up,
        neutral: baseTrendColors.neutral,
      }
    : baseTrendColors;

  const tooltipMessage =
    formulaHints[title] ||
    "💡 This value is calculated based on your activity";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cn(
              "p-6 transition-all duration-300 cursor-help rounded-2xl border border-[#262626]",
              "bg-[#1c1c1c]",
              // "hover:shadow-[0_0_25px_rgba(83,150,0,0.18)]",
              className
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-gray-300">{title}</p>

                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {value}
                </p>

                {change && (
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-medium flex items-center gap-1",
                      trendColors[trend]
                    )}
                  >
                    <span>{change}</span>
                    <span className="text-xs sm:text-sm text-gray-400">
                      from last month
                    </span>
                  </p>
                )}
              </div>

              {/* Icon container */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#539600] shadow-[0_0_15px_rgba(83,150,0,0.35)]">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </TooltipTrigger>

        <TooltipContent
          side="bottom"
          align="center"
          className="text-sm max-w-[240px] bg-[#111] text-gray-200 border border-[#2a2a2a]"
        >
          {tooltipMessage}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

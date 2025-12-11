import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

// Budget type
interface Budget {
  category: string;
  budget: number;
  spent: number;
  overBudget: boolean;
}

export const BudgetOverview = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // NEW: 3-color progress bar logic
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-[#ff4d4d]";     // Red
    if (percent >= 67) return "bg-[#ff9f43]";      // Orange
    if (percent >= 34) return "bg-[#f7c948]";      // Amber
    return "bg-[#4da6ff]";                         // Blue (start)
  };

  const formatRupees = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axiosInstance.get("/budget/summary");
        setBudgets(res.data || []);
      } catch (err: any) {
        console.error("Error fetching budget summary:", err);
        toast.error(err.response?.data?.message || "Failed to load budgets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  return (
    <Card className="p-6 rounded-3xl border border-[#2a2a2a] bg-gradient-to-br from-[#30391c] to-[#1a1a1a] shadow-xl animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Budget Overview</h2>
        <p className="text-sm text-gray-400">Track your spending by category</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24 bg-[#2a2a2a]" />
              <Skeleton className="h-3 w-full bg-[#2a2a2a]" />
            </div>
          ))
        ) : budgets.length === 0 ? (
          <p className="text-center text-gray-400">No budget data available.</p>
        ) : (
          budgets.map((b, index) => {
            const percentage = (b.spent / b.budget) * 100;
            const barValue =
                 percentage === 0 ? 5 : Math.min(percentage, 100);
            const remaining = b.budget - b.spent;

            return (
              <div
                key={b.category}
                className="space-y-3 animate-slide-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Category header */}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{b.category}</span>

                  <span
                    className={cn(
                      "text-sm font-medium",
                      b.overBudget ? "text-red-400" : "text-gray-300"
                    )}
                  >
                    {formatRupees(b.spent)} / {formatRupees(b.budget)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <Progress
                    value={barValue}
                    className="h-3 bg-[#2a2a2a] rounded-full"
                    indicatorClassName={cn(
                      "transition-all duration-500 rounded-full",
                      getProgressColor(percentage)
                    )}
                  />

                  <div className="flex justify-between text-xs">
                    <span
                      className={cn(
                        "font-medium",
                        b.overBudget ? "text-red-400" : "text-[#b3ff8c]"
                      )}
                    >
                      {b.overBudget
                        ? `Over by ${formatRupees(Math.abs(remaining))}`
                        : `${formatRupees(remaining)} remaining`}
                    </span>

                    <span className="text-gray-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/budgets")}
        className="mt-6 w-full py-3 text-sm font-medium rounded-full 
          bg-[#539600] text-[#050608] hover:bg-[#6bc000]
          shadow-[0_0_20px_rgba(83,150,0,0.35)] transition"
      >
        Manage Budgets
      </button>
    </Card>
  );
};

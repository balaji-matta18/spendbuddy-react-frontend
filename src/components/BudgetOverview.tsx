import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance"; // ✅ Use centralised axios instance

// Matches backend BudgetSummaryResponse
interface Budget {
  category: string;
  budget: number;
  spent: number;
  overBudget: boolean;
  color?: string;
}

export const BudgetOverview = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axiosInstance.get("/budget/summary");

        const categoryColors: Record<string, string> = {
          Food: "bg-orange-500",
          Transport: "bg-blue-500",
          Shopping: "bg-pink-500",
          Housing: "bg-emerald-500",
          Entertainment: "bg-purple-500",
          Bills: "bg-yellow-500",
        };

        const enriched = (res.data || []).map((b: Budget) => ({
          ...b,
          color: categoryColors[b.category] || "bg-primary",
        }));

        setBudgets(enriched);
      } catch (err: any) {
        console.error("Error fetching budget summary:", err);
        toast.error(err.response?.data?.message || "Failed to load budgets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const formatRupees = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  return (
    <Card className="p-6 bg-gradient-card border border-border/50 animate-fade-in rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Budget Overview</h2>
        <p className="text-sm text-muted-foreground">
          Track your spending by category
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))
        ) : budgets.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No budget data available.
          </p>
        ) : (
          budgets.map((b, index) => {
            const percentage = (b.spent / b.budget) * 100;
            const barValue = b.overBudget ? 100 : Math.min(percentage, 100);
            const remaining = b.budget - b.spent;

            return (
              <div
                key={b.category}
                className="space-y-3 animate-slide-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{b.category}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      b.overBudget ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {formatRupees(b.spent)} / {formatRupees(b.budget)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Progress
                    value={barValue}
                    className="h-3"
                    indicatorClassName={cn(
                      "transition-all duration-500 ease-in-out",
                      b.overBudget ? "bg-destructive" : b.color
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    <span
                      className={cn(
                        "font-medium",
                        b.overBudget ? "text-destructive" : "text-success"
                      )}
                    >
                      {b.overBudget
                        ? `Over by ${formatRupees(Math.abs(remaining))}`
                        : `${formatRupees(remaining)} remaining`}
                    </span>
                    <span className="text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate("/budgets")}
        className="mt-6 w-full py-3 text-sm font-medium text-primary hover:text-primary-glow transition-colors border border-border rounded-lg hover:bg-muted/50"
      >
        Manage Budgets
      </button>
    </Card>
  );
};

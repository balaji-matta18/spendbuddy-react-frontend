import {
  ArrowDownRight,
  ArrowUpRight,
  Coffee,
  Home,
  ShoppingBag,
  Car,
  Utensils,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance"; // centralised API client
import { useNavigate } from "react-router-dom"; // ✅ added

// Category icons
const categoryIcons: Record<string, any> = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Transport: Car,
  Housing: Home,
  Coffee: Coffee,
  Income: Coffee,
  Bills: Home,
};

// Transaction model
interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

// Props the Dashboard can pass
interface TransactionListProps {
  recent?: Transaction[];
  loading?: boolean;
  title?: string;
}

export const TransactionList = ({
  recent,
  loading = false,
  title = "Recent Transactions",
}: TransactionListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(loading);
  const navigate = useNavigate(); // ✅ added

  useEffect(() => {
    if (recent && recent.length > 0) {
      setTransactions(recent);
      setIsLoading(loading);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/recent");

        const formatted = (res.data || []).map((t: any) => ({
          id: t.id,
          title: t.description || "Transaction",
          category: t.category || "General",
          amount: t.amount || 0,
          date: new Date(t.expenseDate).toLocaleDateString(),
          type: t.type === "INCOME" ? "income" : "expense",
        }));

        setTransactions(formatted);
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        toast.error(
          error.response?.data?.message || "Failed to load transactions."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [recent, loading]);

  return (
    <Card className="p-6 bg-gradient-card border-border/50 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your latest financial activities
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          transactions.map((transaction, index) => {
            const IconComponent =
              categoryIcons[transaction.category] || ShoppingBag;
            const isIncome = transaction.type === "income";

            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border border-border",
                  "hover:bg-muted/50 transition-all duration-200 cursor-pointer",
                  "animate-slide-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left side */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                      isIncome ? "bg-success/10" : "bg-muted"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "h-5 w-5",
                        isIncome ? "text-success" : "text-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">
                        {transaction.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="hidden sm:inline-flex text-xs"
                      >
                        {transaction.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {transaction.date}
                    </p>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0">
                  <p
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      isIncome ? "text-success" : "text-foreground"
                    )}
                  >
                    {isIncome ? "+" : ""}₹
                    {Math.abs(transaction.amount).toLocaleString("en-IN")}
                  </p>

                  {isIncome ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => navigate("/expenses")} // FIXED
        className="mt-6 w-full py-3 text-sm font-medium text-primary hover:text-primary-glow transition-colors"
      >
        View All Transactions
      </button>
    </Card>
  );
};

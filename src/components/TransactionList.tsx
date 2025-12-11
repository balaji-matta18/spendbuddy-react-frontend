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
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";

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

interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

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
  const navigate = useNavigate();

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
    <Card className="p-6 rounded-3xl border border-[#2a2a2a] bg-gradient-to-br from-[#30391c] to-[#1a1a1a] shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">
          Your latest financial activities
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]"
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
          <p className="text-center text-gray-400">No transactions found.</p>
        ) : (
          transactions.map((transaction, index) => {
            const IconComponent =
              categoryIcons[transaction.category] || ShoppingBag;
            const isIncome = transaction.type === "income";

            return (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border border-[#2a2a2a]",
                  "bg-[#1a1a1a] hover:bg-[#3b4a28] transition-all duration-200 cursor-pointer",
                  "animate-slide-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Left */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      isIncome
                        ? "bg-[#3d561a]"
                        : "bg-[#2a2a2a]"
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "h-5 w-5",
                        isIncome ? "text-[#b3ff8c]" : "text-gray-300"
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white truncate">
                        {transaction.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="hidden sm:inline-flex text-xs bg-[#30391c] text-[#b3ff8c] border border-[#3d561a]"
                      >
                        {transaction.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-400">
                      {transaction.date}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                  <p
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      isIncome ? "text-[#b3ff8c]" : "text-white"
                    )}
                  >
                    {isIncome ? "+" : ""}₹
                    {Math.abs(transaction.amount).toLocaleString("en-IN")}
                  </p>

                  {isIncome ? (
                    <ArrowUpRight className="h-4 w-4 text-[#b3ff8c]" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View all button */}
      <button
        onClick={() => navigate("/expenses")}
        className="mt-6 w-full py-3 text-sm font-medium rounded-full 
          bg-[#539600] text-[#050608] hover:bg-[#6bc000] 
          shadow-[0_0_20px_rgba(83,150,0,0.35)] transition"
      >
        View All Transactions
      </button>
    </Card>
  );
};

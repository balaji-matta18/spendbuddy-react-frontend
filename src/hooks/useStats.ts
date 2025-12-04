// ✅ src/hooks/useStats.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";

// Match backend's Expense model
export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

// Shape for frontend stats display
export interface Stats {
  totalBalance: number;
  income: number;
  expenses: number;
  savings: number;
  balanceChange: string;
  incomeChange: string;
  expensesChange: string;
  savingsChange: string;
}

// ✅ Fetch stats from backend
const fetchStats = async (): Promise<Stats> => {
  try {
    // 🔹 Correct backend endpoint (singular + no hyphen)
    const { data: expenses } = await axiosInstance.get<Expense[]>(
      "/expense/currentmonth"
    );

    // 🔹 Calculate totals
    const income = expenses
      .filter((exp) => exp.type === "income")
      .reduce((sum, exp) => sum + exp.amount, 0);

    const expensesTotal = expenses
      .filter((exp) => exp.type === "expense")
      .reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

    const savings = income - expensesTotal;
    const totalBalance = savings;

    // 🔹 Return structured stats
    return {
      totalBalance,
      income,
      expenses: expensesTotal,
      savings,
      balanceChange: "+12.5% from last month",
      incomeChange: "+5.2% from last month",
      expensesChange: "-8.1% from last month",
      savingsChange: "+18.3% from last month",
    };
  } catch (err: any) {
    console.error("[useStats] Error fetching stats:", err?.response || err);
    throw new Error(
      err?.response?.data?.message ||
        "Failed to load financial stats. Please try again."
    );
  }
};

// ✅ React Query hook wrapper
export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    retry: false, // prevent infinite retries on auth failure
  });
};

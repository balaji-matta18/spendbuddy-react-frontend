// ✅ src/hooks/useTransactions.ts
import { useQuery } from "@tanstack/react-query";
import { expenseApi, Expense } from "@/api/expense";

export interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    // 🔹 Fetch all expenses for current month (correct endpoint)
    const expenses: Expense[] = await expenseApi.getCurrentMonth();

    // 🔹 Map to UI-friendly format
    return expenses.map((exp) => ({
      id: exp.id ?? 0,
      title: exp.title || "Untitled",
      category: exp.category || "Other",
      amount: exp.amount,
      date: exp.date,
      type: exp.type || (exp.amount < 0 ? "expense" : "income"),
    }));
  } catch (err: any) {
    console.error("[useTransactions] Error fetching transactions:", err);
    throw new Error(
      err?.response?.data?.message ||
        "Failed to load transactions. Please try again."
    );
  }
};

// ✅ React Query hook
export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    retry: false, // prevent retry loops on 401
  });
};

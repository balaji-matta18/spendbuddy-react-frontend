// ✅ src/hooks/useBudgets.ts
import { useQuery } from "@tanstack/react-query";
import { categoryApi, Category } from "@/api/category";
import { expenseApi, Expense } from "@/api/expense";

export interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-chart-1"];

const fetchBudgets = async (): Promise<BudgetItem[]> => {
  try {
    // 🔹 Fetch both category list & current month expenses
    const [categories, expenses] = await Promise.all([
      categoryApi.getAll() as Promise<Category[]>,      // /api/category
      expenseApi.getCurrentMonth() as Promise<Expense[]> // /api/expense/currentmonth
    ]);

    // 🔹 Map each category to its spending summary
    return categories.map((cat, index) => {
      const categoryExpenses = expenses.filter(
        (exp) => exp.category === cat.name && exp.type === "expense"
      );

      const spent = categoryExpenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

      // Temporary logic (until backend provides budgets)
      const budget = spent > 0 ? spent * 1.2 : 1000;

      return {
        category: cat.name,
        spent,
        budget,
        color: colors[index % colors.length],
      };
    });
  } catch (err: any) {
    console.error("[useBudgets] Error fetching budgets:", err?.response || err);
    throw new Error(
      err?.response?.data?.message ||
      "Failed to load budgets. Please try again."
    );
  }
};

// ✅ React Query hook
export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
    retry: false, // avoid unnecessary retries on 401
  });
};

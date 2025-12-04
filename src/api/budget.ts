// ✅ src/api/budget.ts
import axiosInstance from "./axiosInstance";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

export interface Budget {
  category: string;
  spent: number;
  budget: number;
  color?: string;
}

// ✅ Compute budgets dynamically (no direct backend endpoint)
export const budgetApi = {
  getAll: async (): Promise<Budget[]> => {
    try {
      // Fetch both categories and expenses for the current month
      const [categoriesRes, expensesRes] = await Promise.all([
        axiosInstance.get<Category[]>("/category"),
        axiosInstance.get<Expense[]>("/expense/currentmonth"),
      ]);

      const categories = categoriesRes.data || [];
      const expenses = expensesRes.data || [];

      // Assign consistent UI colors
      const categoryColors: Record<string, string> = {
        Food: "bg-orange-500",
        Transport: "bg-blue-500",
        Shopping: "bg-pink-500",
        Housing: "bg-emerald-500",
        Entertainment: "bg-purple-500",
        Bills: "bg-yellow-500",
      };

      // Calculate total spent and a simulated budget for each category
      return categories.map((cat, index) => {
        const categoryExpenses = expenses.filter(
          (exp) => exp.category === cat.name && exp.type === "expense"
        );

        const spent = categoryExpenses.reduce(
          (sum, exp) => sum + Math.abs(exp.amount),
          0
        );

        // Simulated budget — you can later replace this with a backend value
        const budget = spent > 0 ? spent * 1.2 : 1000;

        return {
          category: cat.name,
          spent,
          budget,
          color: categoryColors[cat.name] || "bg-primary",
        };
      });
    } catch (err: any) {
      console.error("[budgetApi] Error fetching budgets:", err?.response || err);
      throw new Error(
        err?.response?.data?.message ||
          "Failed to load budget data. Please try again."
      );
    }
  },
};

import { Navbar } from "@/components/Navbar";
import { StatsCard } from "@/components/StatsCard";
import { TransactionList } from "@/components/TransactionList";
import { BudgetOverview } from "@/components/BudgetOverview";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  TrendingDown,
  BarChart3,
  PiggyBank,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/api/axiosInstance"; // ✅ Use global API client

interface Stats {
  totalBalance: number;
  expenses: number;
  avgDailySpending: number;
  savings: number;
  balanceChange?: string;
  expensesChange?: string;
  spendingsChange?: string;
  savingsChange?: string;
}

interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  description?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [setupMissing, setSetupMissing] = useState({
    categories: false,
    subcategories: false,
    paymentTypes: false,
  });
  const navigate = useNavigate();

  const formatRupees = (amount: number): string =>
    `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      toast.error("Session expired. Please login again.");
      setIsLoading(false);
      setRecentLoading(false);
      return;
    }

    /** ------------------------------
     *  FETCH DASHBOARD STATISTICS
     * ------------------------------ */
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/stats");
        setStats(res.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        toast.error(
          err?.response?.data?.message || "Unable to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    /** ------------------------------
     *  FETCH RECENT TRANSACTIONS
     * ------------------------------ */
    const fetchRecent = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/recent");

        const formatted = (res.data || []).map((t: any) => ({
          id: t.id,
          title: t.description || "Expense",
          category: t.category || "General",
          amount: t.amount || 0,
          date: new Date(t.expenseDate).toLocaleDateString(),
          type: "expense",
          description: [
            t.category || "",
            t.subCategory ? `• ${t.subCategory}` : "",
            t.paymentType ? `• ${t.paymentType}` : "",
          ]
            .filter(Boolean)
            .join(" "),
        }));

        setRecent(formatted);
      } catch (err: any) {
        console.error("Failed to fetch recent transactions:", err);
        toast.error(
          err?.response?.data?.message ||
            "Unable to load recent transactions."
        );
      } finally {
        setRecentLoading(false);
      }
    };

    /** ------------------------------
     *  CHECK INITIAL SETUP COMPLETENESS
     * ------------------------------ */
    const checkSetup = async () => {
      try {
        const [cat, pay] = await Promise.all([
          axiosInstance.get("/budget/all"),
          axiosInstance.get("/paymenttype"),
        ]);

        let subcategoryExists = false;

        if (cat.data.length > 0) {
          for (const budget of cat.data) {
            try {
              const subRes = await axiosInstance.get(
                `/subcategory?budgetId=${budget.id}`
              );
              if (subRes.data.length > 0) {
                subcategoryExists = true;
                break;
              }
            } catch {
              continue;
            }
          }
        }

        setSetupMissing({
          categories: cat.data.length === 0,
          subcategories: !subcategoryExists,
          paymentTypes: pay.data.length === 0,
        });
      } catch (err) {
        console.error("Setup check failed:", err);
      }
    };

    fetchStats();
    fetchRecent();
    checkSetup();
  }, []);

  const isSetupIncomplete =
    setupMissing.categories ||
    setupMissing.subcategories ||
    setupMissing.paymentTypes;

  const showBanner = isSetupIncomplete && !bannerDismissed;

  /** ------------------------------
   *  TREND DETECTION
   * ------------------------------ */
  const getTrend = (
    value?: string,
    reverse = false
  ): "up" | "down" | "neutral" => {
    if (!value) return "neutral";
    const isPositive = value.startsWith("+");
    if (reverse) {
      return isPositive ? "up" : "down"; // Green if +
    }
    return isPositive ? "down" : "up"; // Red if +
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔧 Setup Banner */}
        {showBanner && (
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 animate-fade-in">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  🔧 Complete your setup to start tracking expenses
                </p>
                <div className="flex flex-wrap gap-2">
                  {setupMissing.categories && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/budgets")}
                    >
                      Add Categories
                    </Button>
                  )}
                  {setupMissing.subcategories && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/subcategories")}
                    >
                      Add Subcategories
                    </Button>
                  )}
                  {setupMissing.paymentTypes && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/payment-types")}
                    >
                      Add Payment Types
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBannerDismissed(true)}
                className="ml-4 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome back,{" "}
              {localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!).username || "User"
                : "User"}
              !
            </h1>
            <p className="text-muted-foreground">
              Here’s your financial overview for this month
            </p>
          </div>

          <Button className="gap-2" onClick={() => navigate("/expenses")}>
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border bg-card">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Balance"
                value={formatRupees(stats?.totalBalance ?? 0)}
                change={stats?.balanceChange || "+0%"}
                icon={Wallet}
                trend={getTrend(stats?.balanceChange, true)}
                reverseColor={true}
              />

              <StatsCard
                title="Expenses"
                value={formatRupees(stats?.expenses ?? 0)}
                change={stats?.expensesChange || "+0%"}
                icon={TrendingDown}
                trend={getTrend(stats?.expensesChange)}
              />

              <StatsCard
                title="Avg Daily Spendings"
                value={formatRupees(stats?.avgDailySpending ?? 0)}
                change={stats?.spendingsChange || "+0%"}
                icon={BarChart3}
                trend={getTrend(stats?.spendingsChange)}
              />

              <StatsCard
                title="Savings"
                value={formatRupees(stats?.savings ?? 0)}
                change={stats?.savingsChange || "+0%"}
                icon={PiggyBank}
                trend={getTrend(stats?.savingsChange, true)}
                reverseColor={true}
              />
            </>
          )}
        </div>

        {/* Transactions + Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionList
              recent={recent}
              loading={recentLoading}
              title="Recent Transactions"
            />
          </div>
          <div>
            <BudgetOverview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

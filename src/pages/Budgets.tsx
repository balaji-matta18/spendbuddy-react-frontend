import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Plus, Trash2, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import axiosInstance from "@/api/axiosInstance"; // ✅ Central API client

interface Budget {
  id?: number;
  category: string;
  budgetAmount: number;
  spent?: number;
  color?: string;
}

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRollover, setShowRollover] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");

  const categoryColors: Record<string, string> = {
    Food: "bg-orange-500",
    Transport: "bg-blue-500",
    Shopping: "bg-pink-500",
    Housing: "bg-emerald-500",
    Entertainment: "bg-purple-500",
    Bills: "bg-yellow-500",
  };

  const formatRupees = (amount: number): string =>
    `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const makeYm = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const getPreviousMonth = (): string => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return makeYm(d);
  };

  const getCurrentMonth = (): string => makeYm(new Date());

  // ✅ Fetch budgets for current month
  const fetchBudgets = async () => {
    try {
      const [allRes, summaryRes] = await Promise.all([
        axiosInstance.get("/budget/all"),
        axiosInstance.get("/budget/summary"),
      ]);

      const spentMap = new Map<string, number>();
      (summaryRes.data || []).forEach((item: any) => {
        spentMap.set(item.category, item.spent || 0);
      });

      const enriched = (allRes.data || []).map((b: any) => ({
        ...b,
        spent: spentMap.get(b.category) || 0,
        color: categoryColors[b.category] || "bg-primary",
      }));

      setBudgets(enriched);
    } catch (error: any) {
      console.error("Error fetching budgets:", error);
      toast.error(error.response?.data?.message || "Failed to load budgets.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Check rollover visibility
  const checkRolloverVisibility = async () => {
    try {
      const userRes = await axiosInstance.get("/user/me");
      const monthStartDay = userRes.data.monthStartDay || 1;
      const today = new Date().getDate();

      if (today === monthStartDay) {
        setShowRollover(true);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const currentMonth = getCurrentMonth();
      const prevMonth = getPreviousMonth();

      const [currentRes, prevRes] = await Promise.allSettled([
        axiosInstance.get(`/budget/all?month=${currentMonth}`, {
          signal: controller.signal,
        }),
        axiosInstance.get(`/budget/all?month=${prevMonth}`, {
          signal: controller.signal,
        }),
      ]);

      clearTimeout(timeout);

      const currentCount =
        currentRes.status === "fulfilled" ? currentRes.value.data.length : 0;
      const prevCount =
        prevRes.status === "fulfilled" ? prevRes.value.data.length : 0;

      setShowRollover(currentCount === 0 && prevCount > 0);
    } catch (error: any) {
      console.error("Error checking rollover visibility:", error.message);
      setShowRollover(false);
    }
  };

  // ✅ Init logic
  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await axiosInstance.get("/user/me");
        const monthStartDay = userRes.data.monthStartDay || 1;
        const today = new Date().getDate();
        const currentMonth = getCurrentMonth();

        const currentBudgetsRes = await axiosInstance.get(
          `/budget/all?month=${currentMonth}`
        );

        const hasCurrentBudgets =
          currentBudgetsRes.data && currentBudgetsRes.data.length > 0;

        if (today === monthStartDay && !hasCurrentBudgets) {
          setBudgets([]);
          setShowRollover(true);
          setIsLoading(false);
          return;
        }

        if (today === monthStartDay && hasCurrentBudgets) {
          setBudgets(currentBudgetsRes.data);
          setShowRollover(false);
          setIsLoading(false);
          return;
        }

        await fetchBudgets();
        await checkRolloverVisibility();
      } catch (err) {
        console.error("Error during budget init:", err);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ✅ Manual rollover
  const handleRollover = async () => {
    const confirmCopy = window.confirm(
      "Do you want to copy last month's budgets into this month?"
    );
    if (!confirmCopy) return toast.info("Rollover cancelled.");

    try {
      await axiosInstance.post("/budget/rollover", {});
      toast.success("Budgets rolled over successfully!");
      setShowRollover(false);
      fetchBudgets();
    } catch (error: any) {
      console.error("Error during rollover:", error);
      toast.error(error.response?.data?.message || "Failed to rollover budgets.");
    }
  };

  // ✅ Add / Update / Delete logic
  const handleSaveBudget = async () => {
    if (!newCategory || !newBudget) {
      toast.error("Please fill in all fields.");
      return;
    }

    const payload = {
      category: newCategory.trim(),
      budgetAmount: parseFloat(newBudget),
    };

    try {
      if (editMode && editingId) {
        await axiosInstance.put(`/budget/${editingId}`, payload);
        toast.success("Budget updated!");
      } else {
        await axiosInstance.post("/budget", payload);
        toast.success("Budget added!");
      }

      setIsModalOpen(false);
      setNewCategory("");
      setNewBudget("");
      setEditMode(false);
      setEditingId(null);
      fetchBudgets();
    } catch (error: any) {
      console.error("Error saving budget:", error);
      toast.error(error.response?.data?.message || "Failed to save budget.");
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await axiosInstance.delete(`/budget/${id}`);
      toast.success("Budget deleted!");
      fetchBudgets();
    } catch (error: any) {
      console.error("Error deleting budget:", error);
      toast.error(error.response?.data?.message || "Failed to delete budget.");
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditMode(true);
    setEditingId(budget.id || null);
    setNewCategory(budget.category);
    setNewBudget(budget.budgetAmount.toString());
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setEditingId(null);
    setNewCategory("");
    setNewBudget("");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Budget Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage your spending across categories
            </p>
          </div>

          <div className="flex gap-2">
            {showRollover && (
              <Button variant="outline" onClick={handleRollover}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Rollover Budgets
              </Button>
            )}
            <Button className="gap-2" onClick={openAddModal}>
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Budget Amount" : "Add New Budget"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Groceries"
                  disabled={editMode}
                />
              </div>

              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 500"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBudget}>
                {editMode ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full mt-4" />
                </CardContent>
              </Card>
            ))
          ) : budgets.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-full">
              No budgets found. Start by adding one.
            </p>
          ) : (
            budgets.map((budget, index) => {
              const spent = budget.spent || 0;
              const remaining = budget.budgetAmount - spent;
              const percentage = (spent / (budget.budgetAmount || 1)) * 100;
              const displayValue = Math.min(percentage, 100);

              return (
                <Card
                  key={budget.id || index}
                  className="hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl capitalize">
                          {budget.category}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {formatRupees(spent)} of{" "}
                          {formatRupees(budget.budgetAmount)}
                        </CardDescription>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(budget)}
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete{" "}
                                <span className="font-semibold">
                                  {budget.category}
                                </span>
                                ?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteBudget(budget.id as number)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <Progress
                      value={displayValue}
                      className="mb-3"
                      indicatorClassName={cn(
                        "transition-all duration-500 ease-in-out",
                        budget.color || "bg-primary"
                      )}
                    />
                    <p className="text-sm font-medium text-success">
                      {formatRupees(remaining)} remaining
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Budgets;

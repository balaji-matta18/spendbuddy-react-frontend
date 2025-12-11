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
import axiosInstance from "@/api/axiosInstance";

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

  // 🎨 Progress bar colour logic (same as Dashboard)
const getBudgetBarColor = (percent: number) => {
  if (percent >= 100) return "bg-[#ff4d4d]";     // Red - overspent
  if (percent >= 67) return "bg-[#ff9f43]";      // Orange - high usage
  if (percent >= 34) return "bg-[#f7c948]";      // Amber - medium usage
  return "bg-[#4da6ff]";                         // Blue - low usage
};


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
      toast.error(error.response?.data?.message || "Failed to load budgets.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRolloverVisibility = async () => {
    try {
      const userRes = await axiosInstance.get("/user/me");
      const monthStartDay = userRes.data.monthStartDay || 1;
      const today = new Date().getDate();

      if (today === monthStartDay) {
        setShowRollover(true);
        return;
      }

      const currentMonth = getCurrentMonth();
      const prevMonth = getPreviousMonth();

      const [currentRes, prevRes] = await Promise.allSettled([
        axiosInstance.get(`/budget/all?month=${currentMonth}`),
        axiosInstance.get(`/budget/all?month=${prevMonth}`),
      ]);

      const currentCount =
        currentRes.status === "fulfilled" ? currentRes.value.data.length : 0;
      const prevCount =
        prevRes.status === "fulfilled" ? prevRes.value.data.length : 0;

      setShowRollover(currentCount === 0 && prevCount > 0);
    } catch {
      setShowRollover(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const today = new Date().getDate();
        const userRes = await axiosInstance.get("/user/me");
        const monthStartDay = userRes.data.monthStartDay || 1;

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

        await fetchBudgets();
        await checkRolloverVisibility();
      } catch {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleRollover = async () => {
    if (!window.confirm("Copy last month's budgets into this month?")) return;

    try {
      await axiosInstance.post("/budget/rollover");
      toast.success("Budgets rolled over!");
      setShowRollover(false);
      fetchBudgets();
    } catch {
      toast.error("Failed to rollover.");
    }
  };

  const handleSaveBudget = async () => {
    if (!newCategory || !newBudget) {
      toast.error("Please fill all fields.");
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
    } catch {
      toast.error("Failed to save budget.");
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await axiosInstance.delete(`/budget/${id}`);
      toast.success("Budget deleted!");
      fetchBudgets();
    } catch {
      toast.error("Failed to delete.");
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
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />

      {/* here we change distance between navbar and page */}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-36">

        {/* HEADER */}
        <div className="mb-10 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Budget Management
            </h1>
            <p className="text-muted-foreground">
              Track and manage category-wise budgets
            </p>
          </div>

          <div className="flex gap-2">
            {showRollover && (
              <Button
                variant="outline"
                className="border-lime-500 text-lime-400 hover:bg-lime-500/20"
                onClick={handleRollover}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Rollover Budgets
              </Button>
            )}

            <Button
              className="gap-2 bg-[#539600] hover:bg-[#6bc000] text-black shadow-[0_0_18px_rgba(83,150,0,0.4)]"
              onClick={openAddModal}
            >
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </div>

        {/* MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md rounded-xl bg-[#111] border border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editMode ? "Edit Budget Amount" : "Add New Budget"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">Category</Label>
                <Input
                  className="bg-[#1b1b1b] text-white border-[#333]"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Food"
                  disabled={editMode}
                />
              </div>

              <div>
                <Label className="text-gray-300">Budget Amount</Label>
                <Input
                  className="bg-[#1b1b1b] text-white border-[#333]"
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="e.g. 1500"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="border-gray-500 text-black hover:bg-white"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-[#539600] hover:bg-[#6bc000] text-black shadow-[0_0_18px_rgba(83,150,0,0.4)]"
                onClick={handleSaveBudget}
              >
                {editMode ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* BUDGET CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-[#111] border-[#333] p-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
                <Skeleton className="h-4 w-full mt-6" />
              </Card>
            ))
          ) : budgets.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">
              No budgets found. Add one to begin.
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
                  className="bg-gradient-to-b from-[#1f2515] to-[#0f1109] border border-[#2d3820] rounded-xl shadow-lg hover:shadow-xl transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl capitalize">
                          {budget.category}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          {formatRupees(spent)} of {formatRupees(budget.budgetAmount)}
                        </CardDescription>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(budget)}
                        >
                          <Pencil className="h-4 w-4 text-lime-400" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </AlertDialogTrigger>

                          {/* <AlertDialogContent className="bg-[#111] border-[#333]"> */}
                          <AlertDialogContent className="max-w-sm w-[90%] rounded-2xl p-6 bg-[#121212] border border-[#2a2a2a]">

                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Delete{" "}
                                <span className="font-semibold text-red-400">
                                  {budget.category}
                                </span>
                                ?
                              </AlertDialogTitle>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-black border-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
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
                      className="h-3 bg-[#242d19] rounded-full mb-3"
                      // indicatorClassName={cn(
                      //   "rounded-full transition-all",
                      //   budget.color
                      // )}

                      indicatorClassName={cn(
                      "rounded-full transition-all duration-500",
                      getBudgetBarColor(percentage)
                    )}

                    />

                    <p className="text-sm font-medium text-lime-300">
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

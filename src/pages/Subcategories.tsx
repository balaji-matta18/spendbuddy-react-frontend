import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance"; // ✅ central API
import { Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface BudgetCategory {
  id: number;
  category: string;
  budgetAmount: number;
}

interface Subcategory {
  id?: number;
  name: string;
}

const Subcategories = () => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  /** ------------------------------
   *   FETCH ALL CATEGORIES
   * ------------------------------ */
  const fetchBudgets = async () => {
    try {
      const res = await axiosInstance.get("/budget/all");
      setBudgets(res.data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load categories.");
    }
  };

  /** ------------------------------
   *   FETCH SUBCATEGORIES BY BUDGET
   * ------------------------------ */
  const fetchSubcategories = async (budgetId: number) => {
    if (!budgetId) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/subcategory?budgetId=${budgetId}`);
      setSubcategories(res.data || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSubcategories([]);
      } else {
        toast.error("Failed to load subcategories.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** ------------------------------
   *   ADD SUBCATEGORY
   * ------------------------------ */
  const handleAddSubcategory = async () => {
    if (!newName || !selectedBudgetId) {
      toast.error("Please enter a name and select a category.");
      return;
    }

    try {
      const payload = {
        name: newName.trim(),
        budgetId: selectedBudgetId,
      };

      await axiosInstance.post("/subcategory", payload);
      toast.success("Subcategory added successfully!");

      setNewName("");
      setIsModalOpen(false);
      fetchSubcategories(selectedBudgetId);
    } catch (error) {
      toast.error("Failed to add subcategory.");
    }
  };

  /** ------------------------------
   *   INITIAL LOAD
   * ------------------------------ */
  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (selectedBudgetId !== null) fetchSubcategories(selectedBudgetId);
  }, [selectedBudgetId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Subcategory Management
            </h1>
            <p className="text-muted-foreground">
              Manage and organise your expense subcategories per category
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              if (!selectedBudgetId) {
                toast.warning("Please select a category first!");
                return;
              }
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <Label>Select a Category</Label>
          <Select onValueChange={(val) => setSelectedBudgetId(Number(val))}>
            <SelectTrigger className="w-full sm:w-64 mt-1">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Cards */}
        {!selectedBudgetId ? (
          <p className="text-muted-foreground text-center mt-10">
            Please select a category to view its subcategories.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </Card>
              ))
            ) : subcategories.length === 0 ? (
              <p className="text-center text-muted-foreground col-span-full">
                No subcategories found for this category.
              </p>
            ) : (
              subcategories.map((sub, index) => (
                <Card
                  key={sub.id || index}
                  className="p-6 hover:shadow-md transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {sub.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Category:{" "}
                    <span className="font-medium">
                      {budgets.find((b) => b.id === selectedBudgetId)?.category}
                    </span>
                  </p>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Add Subcategory Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subcategory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Subcategory Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Restaurants, Groceries, etc."
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubcategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subcategories;

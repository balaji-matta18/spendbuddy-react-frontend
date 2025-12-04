// src/pages/Expenses.tsx
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";  // ✅ USE CENTRAL AXIOS
import {
  Plus,
  Filter,
  Pencil,
  Trash2,
  AlertTriangle,
  XCircle,
  Zap,
} from "lucide-react";

const Expenses = () => {
  const navigate = useNavigate(); 
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    category: "",
    subcategory: "",
    paymentType: "",
  });

  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    paymentType: "",
    startDate: "",
    endDate: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [filterSubcategories, setFilterSubcategories] = useState<any[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
  const [isDataReady, setIsDataReady] = useState(false);

  const safeValue = (v: any) =>
    v === null || v === undefined || v === "" ? "__none__" : String(v);

  /** ---------------------------------------
   * FETCH BASE DATA
   * -------------------------------------- */
  const fetchData = async (filterParams = {}) => {
    try {
      setIsLoading(true);

      const [budgetsRes, payRes, expRes] = await Promise.all([
        axiosInstance.get("/budget/all"),
        axiosInstance.get("/paymenttype"),
        axiosInstance.get("/expense", { params: filterParams }),
      ]);

      setCategories(budgetsRes.data || []);
      setPaymentTypes(payRes.data || []);
      setExpenses(expRes.data || []);

      if (budgetsRes.data.length && payRes.data.length)
        setIsDataReady(true);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /** ---------------------------------------
   * LOAD SUBCATEGORIES
   * -------------------------------------- */
  const fetchSubcategories = async (budgetId: number, type: "modal" | "filter") => {
    try {
      const res = await axiosInstance.get(`/subcategory?budgetId=${budgetId}`);
      if (type === "modal") setSubcategories(res.data || []);
      else setFilterSubcategories(res.data || []);
    } catch {
      type === "modal" ? setSubcategories([]) : setFilterSubcategories([]);
    }
  };

  const handleInputChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFilterChange = (field: string, value: string) => {
    if (value === "__none__") value = "";
    setFilters({ ...filters, [field]: value });
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__none__") value = "";
    setForm({ ...form, category: value, subcategory: "" });

    const selected = categories.find(
      (c) => (c.category ?? c.categoryName) === value
    );

    if (selected?.id) fetchSubcategories(selected.id, "modal");
    else setSubcategories([]);
  };

  const handleFilterCategoryChange = (value: string) => {
    if (value === "__none__") value = "";
    setFilters({ ...filters, category: value, subcategory: "" });

    const selected = categories.find(
      (c) => (c.category ?? c.categoryName) === value
    );

    if (selected?.id) fetchSubcategories(selected.id, "filter");
    else setFilterSubcategories([]);
  };

  /** ---------------------------------------
   * APPLY FILTERS
   * -------------------------------------- */
  const handleApplyFilters = async () => {
    const selectedCat = categories.find(
      (c) => (c.category ?? c.categoryName) === filters.category
    );
    const selectedSub = filterSubcategories.find(
      (s) => (s.name ?? s.subCategoryName) === filters.subcategory
    );

    const params: any = {};
    if (selectedCat?.id) params.budgetId = selectedCat.id;
    if (selectedSub?.id) params.subCategoryId = selectedSub.id;
    if (filters.paymentType) params.paymentType = filters.paymentType;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    toast.info("Applying filters...");
    try {
      const res = await axiosInstance.get("/expense/filter", { params });
      setExpenses(res.data || []);
      toast.success("Filters applied");
    } catch {
      toast.error("Failed to apply filters");
    }
  };

  const handleCurrentMonth = async () => {
    toast.info("Loading current month expenses...");
    try {
      const res = await axiosInstance.get("/expense/current-month");
      setExpenses(res.data || []);
      toast.success("Showing current month expenses");
    } catch {
      toast.error("Failed to fetch current month expenses");
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      paymentType: "",
      startDate: "",
      endDate: "",
    });
    setFilterSubcategories([]);
    fetchData();
    toast.success("Filters cleared");
  };

  /** ---------------------------------------
   * CREATE / UPDATE EXPENSE
   * -------------------------------------- */
  const handleSaveExpense = async () => {
    if (!isDataReady)
      return toast.warning(
        "Please add Categories, Subcategories, and Payment Types first!"
      );

    if (!form.description || !form.amount || !form.category || !form.paymentType)
      return toast.error("Please fill all required fields");

    try {
      const selectedCategory = categories.find(
        (cat) => (cat.category ?? cat.categoryName) === form.category
      );
      const selectedSub = subcategories.find(
        (sub) => (sub.name ?? sub.subCategoryName) === form.subcategory
      );
      const selectedPayment = paymentTypes.find(
        (pt) => (pt.type ?? pt.paymentTypeName) === form.paymentType
      );

      const payload = {
        amount: Number(form.amount),
        expenseDescription: form.description.trim(),
        expenseDate: form.date || new Date().toISOString().split("T")[0],
        paymentTypeId: selectedPayment?.id,
        budgetId: selectedCategory?.id,
        subCategoryId: selectedSub?.id || null,
      };

      if (editMode && editingId) {
        await axiosInstance.put(`/expense/${editingId}`, payload);
        toast.success("Expense updated");
      } else {
        await axiosInstance.post("/expense", payload);
        toast.success("Expense added");
      }

      setIsModalOpen(false);
      setEditMode(false);
      setEditingId(null);
      fetchData();
    } catch {
      toast.error("Failed to save expense");
    }
  };

  /** ---------------------------------------
   * EDIT EXPENSE
   * -------------------------------------- */
  const handleEditExpense = (expense: any) => {
    setEditMode(true);
    setEditingId(expense.id);

    setForm({
      description: expense.description ?? expense.expenseDescription ?? "",
      amount: expense.amount ?? expense.expenseAmount ?? "",
      date: expense.expenseDate ?? "",
      category: expense.category ?? "",
      subcategory: expense.subCategory ?? "",
      paymentType: expense.paymentType ?? "",
    });

    const selectedCat = categories.find(
      (c) => (c.category ?? c.categoryName) === (expense.category ?? "")
    );

    if (selectedCat?.id) fetchSubcategories(selectedCat.id, "modal");
    else setSubcategories([]);

    setIsModalOpen(true);
  };

  /** ---------------------------------------
   * DELETE EXPENSE
   * -------------------------------------- */
  const handleDeleteExpense = (id: number) => {
    setDeleteTarget(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/expense/${deleteTarget}`);
      toast.success("Expense deleted");
      setDeleteConfirm(false);
      fetchData();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Expense Management
            </h1>
            <p className="text-muted-foreground">
              Track, add, edit, delete, and filter your expenses easily.
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              setIsModalOpen(true);
              setEditMode(false);
              setEditingId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Add Expense
          </Button>
        </div>

        {/* 🔍 FILTER SECTION (unchanged UI, cleaned API) */}
        {/* ...existing filter JSX stays identical... */}
        {/* Filters Section */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="h-4 w-4" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {filtersOpen && (
          <Card className="p-6 mb-8 bg-muted/30 rounded-xl border border-border animate-fade-in">
            <div className="space-y-6">
              {/* Category/Subcategory/PaymentType Filters */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 border-b pb-1">
                  Expense Type Filters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select onValueChange={handleFilterCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Selection</SelectItem>
                      {categories.map((cat, i) => (
                        <SelectItem
                          key={i}
                          value={safeValue(cat.category ?? cat.categoryName ?? cat.id)}
                        >
                          {cat.category ?? cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(val) => handleFilterChange("subcategory", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Selection</SelectItem>
                      {filterSubcategories.map((sub, i) => (
                        <SelectItem
                          key={i}
                          value={safeValue(sub.name ?? sub.subCategoryName ?? sub.id)}
                        >
                          {sub.name ?? sub.subCategoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(val) => handleFilterChange("paymentType", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Selection</SelectItem>
                      {paymentTypes.map((pt, i) => (
                        <SelectItem
                          key={i}
                          value={safeValue(pt.type ?? pt.paymentTypeName ?? pt.id)}
                        >
                          {pt.type ?? pt.paymentTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Filters */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 border-b pb-1">
                  Date Filters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 border-b pb-1">
                  ⚡ Quick Actions
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={handleCurrentMonth}>
                      <Zap className="h-4 w-4 mr-2" /> Current Month
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                      <XCircle className="h-4 w-4 mr-2" /> Clear Filters
                    </Button>
                  </div>
                  <Button className="gap-2" onClick={handleApplyFilters}>
                    <Filter className="h-4 w-4" /> Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* EXPENSE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : expenses.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-full">
              No expenses found. Add one to get started.
            </p>
          ) : (
            expenses.map((exp, i) => (
              <Card
                key={i}
                className="p-5 relative hover:shadow-sm transition-all duration-200 border border-border"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {exp.description ?? exp.expenseDescription}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exp.category} • {exp.subCategory} • {exp.paymentType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.expenseDate
                        ? new Date(exp.expenseDate).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-primary text-lg">
                      ₹{exp.amount?.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditExpense(exp)}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteExpense(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-border bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editMode ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
          </DialogHeader>

          {/* ⚠️ Setup warning */}
          {!isDataReady && !editMode && (
            <div className="py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-900 mb-3">
                  ⚠️ Before adding an expense, please set up the following:
                </p>
                <div className="space-y-2">
                  {categories.length === 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-800">No Categories</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/budgets")}
                      >
                        Go to Budgets
                      </Button>
                    </div>
                  )}
                  {subcategories.length === 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-800">No Subcategories</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/subcategories")}
                      >
                        Go to Subcategories
                      </Button>
                    </div>
                  )}
                  {paymentTypes.length === 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-800">No Payment Types</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/payment-types")}
                      >
                        Go to Payment Types
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FORM CONTENT */}
          {(isDataReady || editMode) && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Description</Label>
                <Input
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Dinner at Paradise"
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleInputChange}
                  placeholder="e.g. 700"
                />
              </div>

              <div>
                <Label>Date</Label>
                <Input name="date" type="date" value={form.date} onChange={handleInputChange} />
              </div>

              <div>
                <Label>Category</Label>
                <Select onValueChange={handleCategoryChange} value={form.category} disabled={editMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Selection</SelectItem>
                    {categories.map((cat, i) => (
                      <SelectItem key={i} value={cat.category ?? cat.categoryName}>
                        {cat.category ?? cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subcategory</Label>
                <Select
                  onValueChange={(val) => setForm({ ...form, subcategory: val })}
                  value={form.subcategory}
                  disabled={editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Selection</SelectItem>
                    {subcategories.map((sub, i) => (
                      <SelectItem key={i} value={sub.name ?? sub.subCategoryName}>
                        {sub.name ?? sub.subCategoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Type</Label>
                <Select
                  onValueChange={(val) => setForm({ ...form, paymentType: val })}
                  value={form.paymentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Selection</SelectItem>
                    {paymentTypes.map((pt, i) => (
                      <SelectItem key={i} value={pt.type ?? pt.paymentTypeName}>
                        {pt.type ?? pt.paymentTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            {(isDataReady || editMode) && (
              <Button onClick={handleSaveExpense}>{editMode ? "Update" : "Save"}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Expense?</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to permanently delete this expense? This action cannot be undone.
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;

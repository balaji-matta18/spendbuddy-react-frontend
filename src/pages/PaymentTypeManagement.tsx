import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface PaymentType {
  id: number;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}

const PaymentTypeManagement = () => {
  const [types, setTypes] = useState<PaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState("");

  useEffect(() => {
    fetchTypes();
  }, []);

  /** ------------------------------
   *   GET PAYMENT TYPES
   * ------------------------------ */
  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/paymenttype");
      setTypes(res.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load payment types");
    } finally {
      setIsLoading(false);
    }
  };

  /** ------------------------------
   *   SAVE PAYMENT TYPE (ADD / UPDATE)
   * ------------------------------ */
  const handleSave = async () => {
    if (!typeName.trim()) {
      toast.error("Please enter a payment type name");
      return;
    }

    const payload = { type: typeName.trim() };

    try {
      if (editMode && editingId) {
        await axiosInstance.put(`/paymenttype/${editingId}`, payload);
        toast.success("Payment type updated!");
      } else {
        await axiosInstance.post("/paymenttype", payload);
        toast.success("Payment type added!");
      }

      setIsModalOpen(false);
      setTypeName("");
      setEditMode(false);
      setEditingId(null);
      fetchTypes();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save payment type");
    }
  };

  /** ------------------------------
   *   OPEN MODALS
   * ------------------------------ */
  const openEditModal = (item: PaymentType) => {
    setEditMode(true);
    setEditingId(item.id);
    setTypeName(item.type);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setEditingId(null);
    setTypeName("");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Payment Type Management
            </h1>
            <p className="text-muted-foreground">
              Manage all available payment methods for your expenses
            </p>
          </div>
          <Button className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Payment Type
          </Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : types.length === 0 ? (
            <p className="text-center text-muted-foreground col-span-full">
              No payment types found. Add one to get started.
            </p>
          ) : (
            types.map((item) => (
              <Card
                key={item.id}
                className="p-4 flex justify-between items-start animate-fade-in"
              >
                <div>
                  <h3 className="font-semibold text-foreground">{item.type}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {item.id}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Payment Type" : "Add New Payment Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="e.g. UPI, Card, Cash"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editMode ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTypeManagement;

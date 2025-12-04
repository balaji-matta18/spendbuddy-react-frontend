import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance"; // ✅ Use central API client

interface UserPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

const UserPreferencesModal = ({ open, onClose }: UserPreferencesModalProps) => {
  const [monthStartDay, setMonthStartDay] = useState<number>(1);

  // Load user's existing preference
  const loadPreference = async () => {
    try {
      const res = await axiosInstance.get("/user/me");
      setMonthStartDay(res.data.monthStartDay || 1);
    } catch (e) {
      console.error("Failed to load preferences", e);
    }
  };

  useEffect(() => {
    if (open) loadPreference();
  }, [open]);

  const handleSave = async () => {
    try {
      await axiosInstance.put("/user/preferences", { monthStartDay });
      toast.success("Preferences saved!");
      onClose();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Failed to update preference."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Preferred Month Start Day</Label>
            <Input
              type="number"
              value={monthStartDay}
              min={1}
              max={28}
              onChange={(e) => setMonthStartDay(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This determines when your financial month begins.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPreferencesModal;

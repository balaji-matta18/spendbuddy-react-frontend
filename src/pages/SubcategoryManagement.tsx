// import { useEffect, useState } from "react";
// import { Navbar } from "@/components/Navbar";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import { Plus, Trash2, Pencil } from "lucide-react";
// import axios from "axios";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// const SubcategoryManagement = () => {
//   const [subcategories, setSubcategories] = useState<any[]>([]);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   const [form, setForm] = useState({
//     name: "",
//     category: "",
//   });

//   useEffect(() => {
//     fetchSubcategories();
//     fetchCategories();
//   }, []);

//   const fetchSubcategories = async () => {
//     try {
//       const token = localStorage.getItem("jwt_token");
//       const headers = { Authorization: `Bearer ${token}` };

//       const res = await axios.get("http://localhost:9001/api/subcategory/all", { headers });
//       setSubcategories(res.data || []);
//     } catch (error) {
//       console.error("Error fetching subcategories:", error);
//       toast.error("Failed to load subcategories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const token = localStorage.getItem("jwt_token");
//       const headers = { Authorization: `Bearer ${token}` };
//       const res = await axios.get("http://localhost:9001/api/category/all", { headers });
//       setCategories(res.data || []);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.category) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("jwt_token");
//       const headers = { Authorization: `Bearer ${token}` };
//       const payload = { subCategoryName: form.name, category: form.category };

//       if (editMode && editingId) {
//         await axios.put(`http://localhost:9001/api/subcategory/${editingId}`, payload, { headers });
//         toast.success("Subcategory updated successfully!");
//       } else {
//         await axios.post("http://localhost:9001/api/subcategory", payload, { headers });
//         toast.success("Subcategory added successfully!");
//       }

//       setIsModalOpen(false);
//       setForm({ name: "", category: "" });
//       setEditMode(false);
//       fetchSubcategories();
//     } catch (error) {
//       console.error("Error saving subcategory:", error);
//       toast.error("Failed to save subcategory");
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       const token = localStorage.getItem("jwt_token");
//       const headers = { Authorization: `Bearer ${token}` };

//       await axios.delete(`http://localhost:9001/api/subcategory/${id}`, { headers });
//       toast.success("Subcategory deleted!");
//       fetchSubcategories();
//     } catch (error) {
//       console.error("Error deleting subcategory:", error);
//       toast.error("Failed to delete subcategory");
//     }
//   };

//   const openEditModal = (item: any) => {
//     setEditMode(true);
//     setEditingId(item.id);
//     setForm({ name: item.subCategoryName, category: item.category });
//     setIsModalOpen(true);
//   };

//   const openAddModal = () => {
//     setEditMode(false);
//     setEditingId(null);
//     setForm({ name: "", category: "" });
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />

//       <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Subcategory Management</h1>
//             <p className="text-muted-foreground">Manage subcategories under each category</p>
//           </div>
//           <Button className="gap-2" onClick={openAddModal}>
//             <Plus className="h-4 w-4" /> Add Subcategory
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {isLoading ? (
//             Array.from({ length: 6 }).map((_, i) => (
//               <Skeleton key={i} className="h-24 w-full rounded-lg" />
//             ))
//           ) : subcategories.length === 0 ? (
//             <p className="text-center text-muted-foreground col-span-full">
//               No subcategories found. Add one to get started.
//             </p>
//           ) : (
//             subcategories.map((item, i) => (
//               <Card key={i} className="p-4 flex justify-between items-start animate-fade-in">
//                 <div>
//                   <h3 className="font-semibold text-foreground">{item.subCategoryName}</h3>
//                   <p className="text-sm text-muted-foreground">{item.category}</p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
//                     <Pencil className="h-4 w-4 text-primary" />
//                   </Button>
//                   <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
//                     <Trash2 className="h-4 w-4 text-destructive" />
//                   </Button>
//                 </div>
//               </Card>
//             ))
//           )}
//         </div>
//       </main>

//       {/* Add/Edit Modal */}
//       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>{editMode ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 mt-4">
//             <div>
//               <Label>Name</Label>
//               <Input
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder="e.g. Snacks"
//               />
//             </div>
//             <div>
//               <Label>Category</Label>
//               <select
//                 className="w-full border border-border rounded-md p-2"
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((cat, i) => (
//                   <option key={i} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <DialogFooter className="mt-6 flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setIsModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleSave}>{editMode ? "Update" : "Save"}</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default SubcategoryManagement;

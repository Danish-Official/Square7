import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedLayout } = useLayout();
  const { auth } = useAuth();
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Other",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const categories = [
    "Utilities",
    "Maintenance",
    "Salary",
    "Marketing",
    "Legal",
    "Other"
  ];

  useEffect(() => {
    if (selectedLayout) {
      fetchExpenses();
    }
  }, [selectedLayout]);

  const fetchExpenses = async () => {
    try {
      const { data } = await apiClient.get(`/expenses/layout/${selectedLayout}`);
      setExpenses(data);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        ...formData,
        layoutId: selectedLayout,
        amount: Number(formData.amount)
      };

      if (isEditMode && currentExpense) {
        await apiClient.put(`/expenses/${currentExpense._id}`, expenseData);
        toast.success("Expense updated successfully");
      } else {
        await apiClient.post('/expenses', expenseData);
        toast.success("Expense added successfully");
      }
      
      fetchExpenses();
      handleCloseDialog();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update expense" : "Failed to add expense");
    }
  };

  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || "",
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await apiClient.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense._id !== id));
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrentExpense(null);
    setFormData({
      description: "",
      amount: "",
      category: "Other",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    });
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Expenses Management</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
        >
          Add Expense
        </Button>
      </div>

      <SearchInput
        placeholder="Search expenses by description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-gray-50 border-gray-200 focus:border-blue-500"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              className="bg-gray-50 border-gray-200 focus:border-blue-500"
            />
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-gray-50 border-gray-200 focus:border-blue-500"
            />
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                {isEditMode ? 'Update' : 'Add'} Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedExpenses.map((expense) => (
            <TableRow key={expense._id}>
              <TableCell>{expense.description}</TableCell>
              <TableCell>₹{expense.amount}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>{expense.notes || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2
                    className="cursor-pointer"
                    onClick={() => handleEdit(expense)}
                  />
                  {auth.user?.role === "superadmin" && (
                    <Trash2
                      color="#f00505"
                      className="cursor-pointer"
                      onClick={() => handleDelete(expense._id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

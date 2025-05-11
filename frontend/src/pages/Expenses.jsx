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

// New roles data
const EXPENSE_ROLES = [
  {
    name: 'Architect',
    color: 'bg-gray-900',
    icon: '🏛️'
  },
  {
    name: 'Engineer',
    color: 'bg-gray-900',
    icon: '⚙️'
  },
  {
    name: 'Contractor',
    color: 'bg-gray-900',
    icon: '🏗️'
  },
  {
    name: 'Advocate',
    color: 'bg-gray-900',
    icon: '⚖️'
  },
  {
    name: 'CA',
    color: 'bg-gray-900',
    icon: '📊'
  },
  {
    name: 'Others',
    color: 'bg-gray-900',
    icon: '🧑‍💼'
  }
];

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
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    name: "",
    date: new Date().toISOString().split('T')[0],
    role: "",
  });

  useEffect(() => {
    if (selectedRole && selectedLayout) {
      fetchExpenses();
    }
  }, [selectedLayout, selectedRole]);

  const fetchExpenses = async () => {
    try {
      const { data } = await apiClient.get(`/expenses/layout/${selectedLayout}/role/${selectedRole}`);
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const expenseData = {
        ...formData,
        layoutId: selectedLayout,
        role: selectedRole,
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
      name: expense.name,
      date: new Date(expense.date).toISOString().split('T')[0],
      role: expense.role || "",
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
      name: "",
      date: new Date().toISOString().split('T')[0],
      role: "",
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

  // Role selection modal
  const RoleSelectionModal = () => (
    <Dialog open={showRoleModal} onOpenChange={(open) => {
      setShowRoleModal(open);
      if (!open && !selectedRole) {
        setSelectedRole('Architect');
      }
    }}>
      <DialogContent className="sm:max-w-[900px] p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold text-center">Select Role</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {EXPENSE_ROLES.map((role) => (
            <Button
              key={role.name}
              onClick={() => {
                setSelectedRole(role.name);
                setShowRoleModal(false);
              }}
              className={`text-4xl p-30 flex flex-col items-center justify-center ${role.color} hover:bg-gray-900 text-white`}
            >
              <span className="mb-2">{role.icon}</span>
              <span className="font-semibold">{role.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <RoleSelectionModal />
      {selectedRole && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">Expenses Management</h1>
              <p className="text-gray-500">Managing {selectedRole} expenses</p>
            </div>
            <Button
              onClick={() => setShowRoleModal(true)}
              variant="outline"
              className="mr-4"
            >
              Change Role
            </Button>
            <Button
              className="text-lg font-semibold capitalize cursor-pointer bg-gradient-to-b from-[#1F263E] to-[#5266A4] transition-all duration-200 hover:from-[#5266A4] hover:to-[#1F263E]"
              onClick={() => setIsDialogOpen(true)}
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
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-blue-500"
                />
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
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-blue-500"
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.map((expense) => (
                <TableRow key={expense._id}>
                  <TableCell>{expense.name}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>₹{expense.amount}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
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
        </>
      )}
    </div>
  );
}

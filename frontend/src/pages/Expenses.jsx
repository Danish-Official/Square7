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
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { Edit2, Trash2, Download, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { pdf } from "@react-pdf/renderer";
import ExpensesPDF from "@/components/ExpensesPDF";

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
    amount: "",
    name: "",
    receivedBy: "",
    date: new Date().toISOString().split('T')[0],
    tds: ""
  });

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
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const expenseData = {
        amount: Number(formData.amount),
        name: formData.name,
        receivedBy: formData.receivedBy,
        date: formData.date,
        tds: formData.tds,
        layoutId: selectedLayout
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
      amount: expense.amount,
      name: expense.name,
      receivedBy: expense.receivedBy,
      date: new Date(expense.date).toISOString().split('T')[0],
      tds: expense.tds || ""
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
      amount: "",
      name: "",
      receivedBy: "",
      date: new Date().toISOString().split('T')[0],
      tds: ""
    });
  };

  const handleDownloadStatement = async () => {
    try {
      const blob = await pdf(
        <ExpensesPDF 
          expenses={filteredExpenses} 
          selectedLayout={selectedLayout}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_statement_${selectedLayout}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate statement");
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (expense.receivedBy && expense.receivedBy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (auth.user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-red-500">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Expenses Management</h1>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadStatement}
          >
            <Download className="mr-2 h-4 w-4" />
            Statement
          </Button>
          <Button
            className="text-lg font-semibold capitalize cursor-pointer bg-[#1F263E]"
            onClick={() => setIsDialogOpen(true)}
          >
            Add Expense
          </Button>
        </div>
      </div>

      <SearchInput
        placeholder="Search by name or received by"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[600px] p-6 bg-[#1F263E] rounded-xl">
          <DialogHeader className="space-y-3 mb-6 text-white">
            <DialogTitle className="text-2xl font-semibold">
              {isEditMode ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              type="number"
              placeholder="TDS"
              value={formData.tds}
              onChange={(e) => setFormData({ ...formData, tds: e.target.value })}
              required
              min="0"
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              placeholder="Received By"
              value={formData.receivedBy}
              onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
              required
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-white hover:bg-[#f7f7f7] text-[#1F263E]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-white hover:bg-[#f7f7f7] text-[#1F263E]"
              >
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>TDS</TableHead>
            <TableHead>Net Amount</TableHead>
            <TableHead>Received By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedExpenses.map((expense, index) => (
            <TableRow key={expense._id}>
              <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
              <TableCell>{expense.name}</TableCell>
              <TableCell>{expense.amount}</TableCell>
              <TableCell>{expense.tds}%</TableCell>
              <TableCell>Rs. {expense.netAmount}</TableCell>
              <TableCell>{expense.receivedBy}</TableCell>
              <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2 className="cursor-pointer" color="#000" onClick={() => handleEdit(expense)} />
                  <Download className="cursor-pointer" color="#000" onClick={async () => {
                    try {
                      const blob = await pdf(
                        <ExpensesPDF expenses={[expense]} selectedLayout={selectedLayout} />
                      ).toBlob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `expense_${expense._id}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      toast.error("Failed to download expense PDF");
                    }
                  }} />
                  <Send className="cursor-pointer" color="#000" />
                  {auth.user?.role === "superadmin" && (
                    <Trash2 color="#f00505" className="cursor-pointer" onClick={() => handleDelete(expense._id)} />
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

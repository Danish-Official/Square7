import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { toast } from "react-toastify"; // Import toast
import SearchInput from "@/components/SearchInput";
import { Input } from "@/components/ui/input";

export default function UsersManagement() {
  const { auth } = useAuth(); // Access auth from context
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get("/auth/users");
      setUsers(data);
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchUsers(); // Fetch users when token is available
    }
  }, [auth.token]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiClient.delete(`/auth/users/${id}`);
      toast.success("User deleted successfully"); // Show success toast
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user"); // Show error toast
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await apiClient.post("/auth/create-admin", newAdmin);
      toast.success("Admin user created successfully"); // Show success toast
      setIsDialogOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error("Failed to create admin user"); // Show error toast
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">User Management</h1>

      <SearchInput
        placeholder="Search users by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Button onClick={() => setIsDialogOpen(true)}>Create Admin</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[500px] p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              Create Admin
            </DialogTitle>
            <p className="text-gray-500 text-sm font-normal">
              Add a new administrator to the system
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Input
                placeholder="Name"
                value={newAdmin.name}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                }
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Password"
                type="password"
                value={newAdmin.password}
                onChange={(e) =>
                  setNewAdmin((prev) => ({ ...prev, password: e.target.value }))
                }
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Trash2
                  color="#f00505"
                  className="self-center cursor-pointer"
                  onClick={() => handleDelete(user._id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

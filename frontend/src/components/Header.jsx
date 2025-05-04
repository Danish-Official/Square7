import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/utils";

const Header = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { selectedLayout, setSelectedLayout } = useLayout();
  const [layouts, setLayouts] = React.useState([]);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const response = await apiClient.get("/plots/layouts");
        setLayouts(response.data);
        if (!selectedLayout && response.data.length > 0) {
          setSelectedLayout(response.data[0].toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching layouts:", error);
        toast.error("Failed to fetch layouts");
      }
    };

    if (auth.token) {
      fetchLayouts();
    }
  }, [auth.token, selectedLayout, setSelectedLayout]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout.toLowerCase());
  };

  return (
    <div className="p-4 bg-white text-gray-800 flex justify-between items-center gap-4 shadow-md">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="h-8 w-auto" />
        <Select value={selectedLayout} onValueChange={handleLayoutChange}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Select Layout">
              {selectedLayout ? `KRISHNAM NAGAR ${selectedLayout.replace("layout", "")}` : "Select Layout"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {layouts.map((layout) => (
              <SelectItem key={layout} value={layout.toLowerCase()}>
                {`KRISHNAM NAGAR ${layout.replace("layout", "")}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        {auth.user && <p>Welcome, {auth.user.name}!</p>}
        <LogOut
          onClick={handleLogout}
          className="cursor-pointer text-[#27304f] hover:text-[#37446e]"
        />
      </div>
    </div>
  );
};

export default Header;

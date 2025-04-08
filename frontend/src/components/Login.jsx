import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import logo from "@/assets/logo.png"; // Import the logo image
import { LockKeyholeOpen, Mail } from "lucide-react";
import { toast } from "react-toastify"; // Import toast

export default function Login({ onClose }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth(); // Access login from context
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post("/auth/login", formData);
      login(data.user, data.token); // Pass the entire user object
      toast.success("Login successful"); // Show success toast
      if (onClose) {
        onClose(); // Close the modal on successful login
      } else {
        navigate("/"); // Navigate to the dashboard if no onClose is provided
      }
    } catch (err) {
      setError("Invalid email or password");
      toast.error("Login failed");
    }
  };

  return (
    <div className="flex">
      <div className="w-1/2 flex items-center justify-center">
        <img src={logo} alt="Logo" className="max-w-[90%] h-auto" />
      </div>
      <div className="w-1/2 p-6 pt-0">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <h3 className="text-[#CE9921] text-[2.25rem] mb-2">Welcome !</h3>
        <p className="text-[#C6C6C6] mb-2">Enter your username and password</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <div className="relative">
              <Mail
                color="black"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="pl-10 placeholder:text-xs placeholder:text-black" // Add padding to avoid overlapping with the icon
              />
            </div>
          </div>
          <div className="mb-4">
            <div className="relative">
              <LockKeyholeOpen
                color="black"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="pl-10 placeholder:text-xs placeholder:text-black" // Add padding to avoid overlapping with the icon
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1F263E] hover:bg-[#383e52] rounded-[25px]"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

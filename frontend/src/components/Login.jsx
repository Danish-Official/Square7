import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import logo from "@/assets/logo.png";
import { LockKeyholeOpen, LogIn, Mail } from "lucide-react";
import { toast } from "react-toastify";

export default function Login({ isModal = false }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { setShowLayoutModal } = useLayout();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post("/auth/login", formData);
      login(data.user, data.token);
      toast.success("Login successful");
      navigate("/");
      setShowLayoutModal(true);
    } catch (err) {
      setError("Invalid email or password");
      toast.error("Login failed");
    }
  };

  return (
    <div className="flex relative">
      <div className="w-1/2 flex items-center justify-center">
        <img
          src={logo}
          alt="Logo"
          className={`${isModal ? 'max-w-[70%]' : 'max-w-[90%]'} h-auto`}
        />
      </div>
      <div className="w-1/2 p-6 pt-0">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <LogIn size={30} strokeWidth={1}/>
        <p className="text-[#C6C6C6] mb-4">Enter your username and password</p>
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
                className="pl-10 placeholder:text-xs placeholder:text-black"
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
                className="pl-10 placeholder:text-xs placeholder:text-black"
              />
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline mt-4 block"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1F263E] hover:bg-[#383e52] rounded-[25px] mt-2"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

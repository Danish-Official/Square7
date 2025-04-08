import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { LogOut } from "lucide-react"; // Import LogOut icon
import logo from "@/assets/logo.png"; // Import logo

const Header = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth(); // Access auth and logout from context

  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="p-4 bg-white text-gray-800 flex justify-end items-center gap-4 shadow-md">
      {auth.user && <p>Welcome, {auth.user.name}!</p>}
      {/* Display user's name */}
      <LogOut
        onClick={handleLogout}
        className="cursor-pointer text-[#27304f] hover:text-[#37446e]"
      />
      {/* Add logo */}
      <img src={logo} alt="Logo" className="h-8 w-auto" />
    </div>
  );
};

export default Header;

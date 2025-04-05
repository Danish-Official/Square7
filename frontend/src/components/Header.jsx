import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const Header = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth(); // Access auth and logout from context

  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="p-4 bg-white text-gray-800 flex justify-end items-center gap-4 shadow-md">
      {auth.user && <p>Welcome, {auth.user.name}!</p>}{" "}
      {/* Display user's name */}
      <button
        onClick={handleLogout}
        className="p-2 bg-[#27304f] text-white rounded-lg hover:bg-[#37446e]"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;

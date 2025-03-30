import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import useNavigate
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import {
  Banknote,
  Home,
  UserRoundCog,
  Users,
  PanelRightClose,
  PanelLeftClose,
  BookUser,
  ReceiptIndianRupee,
  LayoutDashboard,
  MessageCircleQuestion,
} from "lucide-react"; // Icons

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth(); // Access auth from context

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className={`md:hidden p-2 text-white bg-gray-800 ${
          isOpen ? "panel-left-close" : "panel-right-close"
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
      </button>
      <div
        className={`fixed inset-0 w-64 bg-gray-900 text-white p-4 transition-transform transform z-50 h-full ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:block`}
      >
        {isOpen && (
          <button
            className="absolute top-4 right-4 text-white"
            onClick={toggleSidebar}
          >
            <PanelLeftClose size={20} />
          </button>
        )}
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
          <NavItem
            to="/plot-management"
            icon={<LayoutDashboard size={20} />}
            label="Plot Management"
          />
          <NavItem
            to="/contact-list"
            icon={<BookUser size={20} />}
            label="Contact List"
          />
          <NavItem
            to="/invoices"
            icon={<ReceiptIndianRupee size={20} />}
            label="Invoices"
          />
          <NavItem
            to="/enquiries"
            icon={<MessageCircleQuestion size={20} />}
            label="Enquiries"
          />
          {auth.user?.role === "superadmin" && ( // Check the role from the user object
            <NavItem
              to="/user-management"
              icon={<UserRoundCog size={20} />}
              label="Manage Users"
            />
          )}
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 rounded-lg transition ${
        isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700"
      }`
    }
  >
    {icon}
    <span className="ml-3">{label}</span>
  </NavLink>
);

export default Sidebar;

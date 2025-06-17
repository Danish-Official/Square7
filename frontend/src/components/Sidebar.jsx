import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import useNavigate
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useLayout } from "@/context/LayoutContext"; // Import useLayout
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
  Image,
  Handshake,
  IndianRupee,
  Trash2, // Add this import
} from "lucide-react"; // Icons
import Layout1 from "@/assets/layouts/Layout1.png"; // Import layout images
import Layout2 from "@/assets/layouts/Layout2.png"; // Import layout images

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth(); // Access auth from context
  const { selectedLayout } = useLayout(); // Access selectedLayout from context

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className={`md:hidden p-2 text-white bg-gray-800 ${isOpen ? "panel-left-close" : "panel-right-close"
          }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
      </button>
      <div
        className={`fixed inset-0 w-64 bg-gray-900 text-white p-4 transition-transform transform z-50 h-full ${isOpen ? "translate-x-0" : "-translate-x-full"
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
        <div className="flex items-center justify-center mb-4">
          <img
            src={selectedLayout === "layout1" ? Layout1 : Layout2}
            alt="Layout"
            className="h-23 w-auto"
          />
        </div>
        <nav className="flex flex-col space-y-2">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
          <NavItem
            to="/plot-management"
            icon={<LayoutDashboard size={20} />}
            label="Layout Management"
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
          <NavItem
            to="/brokers"
            icon={<Handshake size={20} />}
            label="Advisors"
          />
          {auth.user?.role === "superadmin" &&
            <>
              <NavItem
                to="/layout-resources"
                icon={<Image size={20} />}
                label="Layout Resources"
              />
              <NavItem
                to="/expenses"
                icon={<IndianRupee size={20} />}
                label="Expenses"
              />
              <NavItem
                to="/deleted-contacts"
                icon={<Trash2 size={20} />}
                label="Deleted Contacts"
              />
              <NavItem
                to="/user-management"
                icon={<UserRoundCog size={20} />}
                label="Manage Users"
              />
            </>
          }
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-2 rounded-lg transition ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-700"
      }`
    }
  >
    {icon}
    <span className="ml-3">{label}</span>
  </NavLink>
);

export default Sidebar;

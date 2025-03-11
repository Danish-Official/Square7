import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Banknote, Home, UserRoundCog, Users } from "lucide-react"; // Icons

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        className="md:hidden p-2 text-white bg-gray-800"
        onClick={toggleSidebar}
      >
        {isOpen ? "Close" : "Open"} Menu
      </button>
      <div
        className={`fixed inset-0 w-64 bg-gray-900 text-white p-4 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:block`}
      >
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
          <NavItem
            to="/plot-management"
            icon={<UserRoundCog size={20} />}
            label="Plot Management"
          />
          <NavItem
            to="/buyer-management"
            icon={<Users size={20} />}
            label="Manage Buyers"
          />
          <NavItem
            to="/finance"
            icon={<Banknote size={20} />}
            label="Finance"
          />
          <NavItem
            to="/user-management"
            icon={<UserRoundCog size={20} />}
            label="Billing Invoice"
          />
          <NavItem
            to="/user-management"
            icon={<UserRoundCog size={20} />}
            label="Manage Users"
          />
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

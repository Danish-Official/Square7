import { NavLink } from "react-router-dom";
import { Banknote, Home, UserRoundCog, Users } from "lucide-react"; // Icons

const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
        <NavItem to="/buyer-management" icon={<Users size={20} />} label="Manage Buyers" />
        <NavItem to="/finance" icon={<Banknote size={20} />} label="Finance" />
        <NavItem to="/user-management" icon={<UserRoundCog size={20} />} label="Manage Users" />
      </nav>
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

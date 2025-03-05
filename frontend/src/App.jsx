import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BuyerManagement from "./pages/BuyerManagement";
import UserManagment from "./pages/UserManagment";
import Finance from "./pages/Finance";
import Layout from "./pages/Layout";
import PlotManagement from "./pages/PlotManagement";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="plot-management" element={<PlotManagement />} />
        <Route path="buyer-management" element={<BuyerManagement />} />
        <Route path="user-management" element={<UserManagment />} />
        <Route path="finance" element={<Finance />} />
      </Route>
    </Routes>
  );
}

export default App;

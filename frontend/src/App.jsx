import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import PlotManagement from "./pages/PlotManagement";
import BuyersManagement from "./pages/BuyersManagement";
import UsersManagement from "./pages/UserManagment";
import Invoices from "./pages/Invoices";
import NewBooking from "./pages/NewBooking";
import Login from "./components/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="plot-management" element={<PlotManagement />} />
        <Route path="buyer-management" element={<BuyersManagement />} />
        <Route path="user-management" element={<UsersManagement />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="new-booking" element={<NewBooking />} />
      </Route>
    </Routes>
  );
}

export default App;

import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import PlotManagement from "./pages/PlotManagement";
import BuyersManagement from "./pages/BuyersManagement";
import UsersManagement from "./pages/UserManagment";
import Invoices from "./pages/Invoices";
import NewBooking from "./pages/NewBooking";
import { useEffect } from "react";
import Enquiries from "./pages/Enquiries";
import { BuyersProvider } from "@/context/BuyersContext";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to homepage if not logged in
    }
  }, [navigate]);

  return (
    <BuyersProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="plot-management" element={<PlotManagement />} />
          <Route path="contact-list" element={<BuyersManagement />} />
          <Route path="user-management" element={<UsersManagement />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="new-booking" element={<NewBooking />} />
        </Route>
      </Routes>
    </BuyersProvider>
  );
}

export default App;

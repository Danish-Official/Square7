import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
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
import { useAuth } from "@/context/AuthContext"; // Import useAuth

function ProtectedRoute({ children, allowedRoles }) {
  const { auth } = useAuth();
  if (!auth.token) {
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }
  if (allowedRoles && !allowedRoles.includes(auth.user?.role)) {
    return <Navigate to="/" replace />; // Redirect if role is not allowed
  }
  return children;
}

function App() {
  const navigate = useNavigate();
  const { auth } = useAuth(); // Access auth from context

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to homepage if not logged in
    }
  }, [navigate]);

  useEffect(() => {
    if (
      auth.user?.role !== "superadmin" && // Check the role from the user object
      window.location.pathname === "/user-management"
    ) {
      navigate("/"); // Redirect admin users away from user-management
    }
  }, [auth.user, navigate]);

  return (
    <BuyersProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route
            path="plot-management"
            element={
              <ProtectedRoute>
                <PlotManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="contact-list"
            element={
              <ProtectedRoute>
                <BuyersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="user-management"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <UsersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="enquiries"
            element={
              <ProtectedRoute>
                <Enquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="new-booking"
            element={
              <ProtectedRoute>
                <NewBooking />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BuyersProvider>
  );
}

export default App;

import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter
import Dashboard from "./pages/Dashboard";
import PlotManagement from "./pages/LayoutManagement";
import BuyersManagement from "./pages/BuyersManagement";
import UsersManagement from "./pages/UserManagment";
import Invoices from "./pages/Invoices";
import NewBooking from "./pages/NewBooking";
import Enquiries from "./pages/Enquiries";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import LoginPage from "./pages/LoginPage";
import { ToastContainer } from "react-toastify";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import BookingPreview from "@/pages/BookingPreview";
import AppWrapper from "./pages/AppWrapper";
import LayoutResources from "./pages/LayoutResources";

function ProtectedRoute({ children, allowedRoles }) {
  const { auth, isTokenExpired } = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  if (isTokenExpired(auth.token)) {
    return <Dashboard showLoginModal={true} />; // Show login modal if token is expired
  }

  if (allowedRoles && !allowedRoles.includes(auth.user?.role)) {
    return <Navigate to="/" replace />; // Redirect if role is not allowed
  }

  return children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} /> {/* Add login route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppWrapper />
            </ProtectedRoute>
          }
        >
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
            path="layout-resources"
            element={
              <ProtectedRoute>
                <LayoutResources />
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
          <Route
            path="booking-preview"
            element={
              <ProtectedRoute>
                <BookingPreview />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import { BuyersProvider } from "./context/BuyersContext";
import { LayoutProvider } from "./context/LayoutContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <LayoutProvider>
        <BuyersProvider>
          <BrowserRouter>
            <App />
            <ToastContainer
              position="top-right" // Ensure the position is set
              autoClose={5000} // Set autoClose to 5 seconds
              hideProgressBar={false} // Show the progress bar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </BrowserRouter>
        </BuyersProvider>
      </LayoutProvider>
    </AuthProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import "./index.css";
import App from "./App.jsx";
import { BuyersProvider } from "./context/BuyersContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BuyersProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </BuyersProvider>
    </AuthProvider>
  </StrictMode>
);

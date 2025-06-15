import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";
import { useLayout } from "./LayoutContext";
import { useAuth } from "./AuthContext"; // Import useAuth

const BuyersContext = createContext();

export function BuyersProvider({ children }) {
  const [buyers, setBuyers] = useState([]);
  const { selectedLayout } = useLayout();
  const { auth } = useAuth(); // Add this line to get auth context

  useEffect(() => {
    if (selectedLayout && auth.token) {
      fetchBuyers();
    }
  }, [selectedLayout, auth.token]); // Add auth.token as dependency

  async function fetchBuyers() {
    try {
      if (!auth.token) return; // Add early return if no token
      const { data } = await apiClient.get(`/bookings/layout/${selectedLayout}`);
      setBuyers(data);
    } catch (error) {
      if (error.response?.status === 401) {
        setBuyers([]); // Clear buyers on auth error
      }
      console.error("Error fetching buyers:", error);
    }
  }

  async function deleteBuyer(id) {
    try {
      await apiClient.delete(`/bookings/${id}`);
      setBuyers((prev) => prev.filter((buyer) => buyer._id !== id));
    } catch (error) {
      // Silent failure, UI component will handle error display
    }
  }

  async function updateBuyer(updatedBuyer) {
    try {
      const { data } = await apiClient.put(
        `/bookings/${updatedBuyer._id}`,
        updatedBuyer
      );
      setBuyers((prev) =>
        prev.map((buyer) => (buyer._id === updatedBuyer._id ? data : buyer))
      );
      await fetchBuyers();
    } catch (error) {
      // Silent failure, UI component will handle error display
    }
  }

  return (
    <BuyersContext.Provider
      value={{
        buyers,
        fetchBuyers,
        deleteBuyer,
        updateBuyer,
      }}
    >
      {children}
    </BuyersContext.Provider>
  );
}

export function useBuyers() {
  return useContext(BuyersContext);
}

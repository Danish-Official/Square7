import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/utils";

const BuyersContext = createContext();

export function BuyersProvider({ children }) {
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    fetchBuyers();
  }, []);

  async function fetchBuyers() {
    try {
      const { data } = await apiClient.get("/bookings");
      setBuyers(data);
    } catch (error) {
      console.error("Error fetching buyers", error);
    }
  }

  async function deleteBuyer(id) {
    try {
      await apiClient.delete(`/bookings/${id}`);
      setBuyers((prev) => prev.filter((buyer) => buyer._id !== id));
    } catch (error) {
      console.error("Error deleting buyer", error);
    }
  }

  async function updateBuyer(updatedBuyer) {
    try {
      const { data } = await apiClient.put(
        `/bookings/${updatedBuyer._id}`,
        updatedBuyer
      ); // Send PUT request
      setBuyers((prev) =>
        prev.map((buyer) => (buyer._id === updatedBuyer._id ? data : buyer))
      );
      await fetchBuyers(); // Refresh the buyers list
    } catch (error) {
      console.error("Error updating buyer", error);
    }
  }

  return (
    <BuyersContext.Provider
      value={{ buyers, fetchBuyers, deleteBuyer, updateBuyer }}
    >
      {children}
    </BuyersContext.Provider>
  );
}

export function useBuyers() {
  return useContext(BuyersContext);
}

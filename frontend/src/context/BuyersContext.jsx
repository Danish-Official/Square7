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
      setBuyers([]); // Set empty array on error
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
        fetchBuyers: fetchBuyers,
        deleteBuyer,
        updateBuyer,
        refetchBuyers: fetchBuyers,
      }}
    >
      {children}
    </BuyersContext.Provider>
  );
}

export function useBuyers() {
  return useContext(BuyersContext);
}

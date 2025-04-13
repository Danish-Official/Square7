import { createContext, useContext, useState, useEffect } from "react";

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [selectedLayout, setSelectedLayout] = useState(() => {
    return localStorage.getItem("selectedLayout") || null;
  });

  useEffect(() => {
    if (selectedLayout) {
      localStorage.setItem("selectedLayout", selectedLayout);
    }
  }, [selectedLayout]);

  return (
    <LayoutContext.Provider value={{ selectedLayout, setSelectedLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

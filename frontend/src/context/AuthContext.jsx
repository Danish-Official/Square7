import React, { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: JSON.parse(localStorage.getItem("user")) || null, // Store the entire user object
    token: localStorage.getItem("token") || null,
  });

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token); // Decode token to get expiration time
      return Date.now() >= exp * 1000; // Check if token is expired
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return true; // Treat invalid tokens as expired
    }
  };

  const login = (user, token) => {
    localStorage.setItem("user", JSON.stringify(user)); // Save user object to localStorage
    localStorage.setItem("token", token);
    setAuth({ user, token });
  };

  const logout = () => {
    localStorage.removeItem("user"); // Remove user object from localStorage
    localStorage.removeItem("token");
    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, isTokenExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

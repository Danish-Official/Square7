import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: localStorage.getItem("username") || null,
    token: localStorage.getItem("token") || null,
  });

  const login = (user, token) => {
    localStorage.setItem("username", user);
    localStorage.setItem("token", token);
    setAuth({ user, token });
  };

  const logout = () => {
    localStorage.setItem("username", ""); // Set username as an empty string
    localStorage.setItem("token", ""); // Set token as an empty string
    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

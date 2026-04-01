// React hooks import kar rahe hain state aur context manage karne ke liye
import React, { createContext, useState, useEffect, useContext } from "react";

// Navigation ke liye (login/logout ke baad redirect karne ke liye)
import { useNavigate } from "react-router-dom";

// ======================================================
// AuthContext create kar rahe hain
// Ye global authentication state store karega
// ======================================================
const AuthContext = createContext();

// ======================================================
// AuthProvider
// Ye pura app wrap karega taaki user & token globally available ho
// ======================================================
export const AuthProvider = ({ children }) => {
  // Logged-in user ka data store karne ke liye state
  const [user, setUser] = useState(null);

  // JWT token store karne ke liye state
  const [token, setToken] = useState(null);

  // Loading state taaki localStorage se data load hone tak UI wait kare
  const [loading, setLoading] = useState(true);

  // Navigation hook (redirect ke liye)
  const navigate = useNavigate();

  // ======================================================
  // App start hote hi localStorage se user load karna
  // Purpose:
  // Page refresh hone par login state maintain rahe
  // ======================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // Agar user aur token dono mil gaye toh state update kar do
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    // Loading false kar rahe hain taaki UI render ho sake
    setLoading(false);
  }, []);

  // ======================================================
  // Login Action
  // Backend se login success hone ke baad call hota hai
  // ======================================================
  const loginAction = (userData, authToken) => {
    // Safety check - token hona zaroori hai
    if (!authToken) {
      console.error("Attempted to login without token");
      return;
    }

    // State update
    setUser(userData);
    setToken(authToken);

    // localStorage me save (taaki refresh par logout na ho)
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);

    // Home page redirect
    navigate("/");
  };

  // ======================================================
  // Logout Action
  // Token aur user dono remove karte hain
  // ======================================================
  const logoutAction = () => {
    // State clear
    setUser(null);
    setToken(null);

    // localStorage clear
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Login page redirect
    navigate("/auth/login");
  };

  // ======================================================
  // Context Provider
  // Ye values pura app access karega
  // ======================================================
  return (
    <AuthContext.Provider
      value={{ user, token, loginAction, logoutAction, loading }}
    >
      {/* Loading complete hone ke baad hi app render hoga */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ======================================================
// Custom Hook
// Purpose:
// Kisi bhi component me easily auth data access karna
// Example:
// const { user } = useAuth()
// ======================================================
export const useAuth = () => {
  return useContext(AuthContext);
};

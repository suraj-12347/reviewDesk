import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure correct import
import React from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Load token on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setUser({
          userId: decoded.id || decoded._id,
          role: decoded.role,
        });
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/login"); // Redirect to login if token is invalid
      }
    } else {
      navigate("/login"); // Redirect if no token is found
    }
  }, []);

  // Handle login
  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
  
      setUser({ 
        userId: decoded.id || decoded._id, 
        role: decoded.role 
      });
  
      // Navigation based on role
      if (decoded.role === "admin") {
        navigate("/admin-dashboard");
      } else if (decoded.role === "reviewer") {
        navigate("/reviewer-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Error decoding token", error);
    }
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

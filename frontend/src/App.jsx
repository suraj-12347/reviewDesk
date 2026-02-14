import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import React from "react";

function PrivateRoute({ element, allowedRoles }) {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? element : <Login />;
}

function App() {
  return (
   <div className="p-10 min-h-screen w-full"><main className="w-full bg-[#f3f4f6] ">
     <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Private Routes */}
      <Route path="/user-dashboard" element={<PrivateRoute element={<UserDashboard />} allowedRoles={["user"]} />} />
      <Route path="/admin-dashboard" element={<PrivateRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
      <Route path="/reviewer-dashboard" element={<PrivateRoute element={<ReviewerDashboard />} allowedRoles={["reviewer"]} />} />
    </Routes>
   </main></div>
  );
}

export default App;

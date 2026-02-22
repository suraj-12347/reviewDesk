import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import Sidebar from "./components/SideBar";
import React from "react";
import PrivateRoute from "./components/PrivateRoute";


import { Outlet } from "react-router-dom";
import Papers from "./pages/Papers";
import AsignRev from "./components/AsignRev";
import RegiteredUsers from "./components/RegiteredUsers";
import UploadPaper from "./components/UploadPaper";

const Layout = () => {
  return (
    <div className="h-screen flex overflow-hidden ">

      {/* Sidebar */}
      <aside className="w-55 bg-white font-semibold flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 scroll1 bg-[#f3f4f6]  overflow-y-auto mr-10">
        <Outlet />
      </main>

    </div>
  );
};

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes with Sidebar Layout */}
    <Route element={<PrivateRoute allowedRoles={["user","admin","reviewer"]} />}>
  <Route element={<Layout />}>
    <Route path="/user-dashboard" element={<UserDashboard />} />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
    <Route path="/reviewer-dashboard" element={<ReviewerDashboard />} />
    
    <Route path='/assign-reviewer'             element={<AsignRev/>}/>
    <Route path='/registered-users'             element={<RegiteredUsers/>}/>
    <Route path='/upload'             element={<UploadPaper/>}/>
  </Route>
</Route>

    </Routes>
  );
}

export default App;
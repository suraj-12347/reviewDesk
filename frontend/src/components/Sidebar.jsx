import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Bell,
  LogOut,
  Users,
  UserPlus,
  ClipboardCheck,
  LayoutDashboard,
} from "lucide-react";
import logo from '../assets/logo.png'

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuByRole = {
    user: [
      { name: "Papers", path: "/user-dashboard", icon: FileText },
      { name: "Upload", path: "/upload", icon: Upload },
      { name: "Notification", path: "/notifications", icon: Bell },
    ],
    admin: [
      { name: "Papers", path: "/admin-dashboard", icon: FileText },
      { name: "Assign Reviewer", path: "/assign-reviewer", icon: ClipboardCheck },
      { name: "Registered Users", path: "/registered-users", icon: Users },
      { name: "Add Reviewer", path: "/add-reviewer", icon: UserPlus },
      { name: "Notification", path: "/notifications", icon: Bell },
    ],
    reviewer: [
      { name: "Papers", path: "/reviewer-dashboard", icon: FileText },
      { name: "Review", path: "/review", icon: LayoutDashboard },
      { name: "Notification", path: "/notifications", icon: Bell },
    ],
  };

  const menuItems = menuByRole[user?.role] || [];

  return (
    <div className="w-55 h-full  bg-white text-grey-700  flex flex-col">

      {/* Logo */}
      <div className="p-6 pb-15 font-bold ">
        <img src={logo} alt="" />
      </div>

      {/* Menu */}
      <div className="flex-1 p-4 space-y-2 text-grey-700">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-full transition ${
                  isActive
                    ? "text-blue-600 "
                    : "hover:text-blue-500"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 ">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:text-blue-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
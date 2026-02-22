import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Papers from "./Papers";


const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [papers, setPapers] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const fetchPapers = async () => {
    if (!user || !user.userId) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/papers/my-papers?userId=${user.userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPapers(response.data);
    } catch (error) {
      console.error("Error fetching papers:", error);
      alert("Failed to fetch papers");
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

 

  return (
    <div
      className="min-h-screen  bg-[#f3f4f6] "
      
    >
      {/* Glass Container */}
      <div className="backdrop-blur-md  ">
        {/* Header */}
        <div className="flex justify-center items-center mb-6 p-4 shadow  bg-white">
          <h1 className="text-4xl font-bold text-gray-800 drop-shadow-md">📚 User Dashboard</h1>
         
        </div>

        {/* Upload Form */}
       

        {/* Papers List */}
        <Papers/>
      </div>
    </div>
  );
};

export default UserDashboard;

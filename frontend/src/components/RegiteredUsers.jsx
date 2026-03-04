import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const RegiteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersRes = await axiosInstance.get("/admin/users");
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Users Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-blue-600 mb-10">
          Registered Users
        </h1>

        {loading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-400">No users found</div>
        ) : (
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-gray-700">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="bg-white shadow-md hover:shadow-xl transition rounded-2xl"
                >
                  <td className="p-5 font-medium rounded-l-2xl">
                    {user.name}
                  </td>
                  <td className="p-5">
                    {user.email}
                  </td>
                  <td className="p-5 rounded-r-2xl">
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 capitalize">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default RegiteredUsers;
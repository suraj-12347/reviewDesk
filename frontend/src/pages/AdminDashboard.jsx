import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Users, FileText, ClipboardCheck, UserCheck } from "lucide-react";


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchPapers();
    fetchReviewers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPapers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/papers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPapers(response.data);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/reviewers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReviewers(response.data);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
    }
  };

  const assignReviewer = async () => {
    if (!selectedPaper || !selectedReviewer) {
      alert("Please select both a paper and a reviewer.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/admin/assign-reviewer",
        {
          paperId: selectedPaper,
          reviewerId: selectedReviewer,
          status: "pending",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert("Reviewer assigned successfully");
      fetchPapers();
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      alert("Failed to assign reviewer");
    }
  };

  const updatePaperStatus = async (paperId, status) => {
    try {
      await axios.put(
        "http://localhost:5000/api/admin/update-status",
        { paperId, status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert(`Paper ${status} successfully!`);
      fetchPapers();
    } catch (error) {
      console.error("Error updating paper status:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/bg.avif')" , width : "98vw"}}
    >
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-blue-600" /> Admin Dashboard
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-blue-500" /> Registered Users
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-blue-500" /> Submitted Papers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Author</th>
                <th className="p-2">Status</th>
                <th className="p-2">Reviewer</th>
                <th className="p-2">Feedback</th>
                <th className="p-2">Attempts</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={paper._id} className="border-t text-center">
                  <td className="p-2 text-black">{paper.title}</td>
                  <td className="p-2 text-black">{paper.author?.name || "Unknown"}</td>
                  <td className="p-2 text-black">{paper.status}</td>
                  <td className="p-2 text-black">
                    {paper.assignedReviewers?.length > 0 ? "Yes" : "No"}
                  </td>
                  <td className="p-2 text-black">
                    {paper.reviews?.length > 0
                      ? `${paper.reviews[0].comments} (${paper.reviews[0].status})`
                      : "No Feedback"}
                  </td>
                  <td className="p-2">{paper.reuploadCount || 0}/3</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => updatePaperStatus(paper._id, "Accepted")}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updatePaperStatus(paper._id, "Rejected")}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="text-blue-500" /> Assign Paper to Reviewer
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            className="border p-2 rounded"
            onChange={(e) => setSelectedPaper(e.target.value)}
            value={selectedPaper}
          >
            <option value="">Select Paper</option>
            {papers.map((paper) => (
              <option key={paper._id} value={paper._id}>
                {paper.title}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            onChange={(e) => setSelectedReviewer(e.target.value)}
            value={selectedReviewer}
          >
            <option value="">Select Reviewer</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer._id} value={reviewer._id}>
                {reviewer.name}
              </option>
            ))}
          </select>

          <button
            onClick={assignReviewer}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, FileText, UploadCloud } from "lucide-react";
import React from "react";

const ReviewerDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [status, setStatus] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const fetchAssignedPapers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reviewer/assigned-papers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const initialFeedback = {};
      const initialStatus = {};
      const initialFiles = {};
      response.data.forEach((paper) => {
        initialFeedback[paper._id] = "";
        initialStatus[paper._id] = paper.status || "Pending";
        initialFiles[paper._id] = null;
      });

      setPapers(response.data);
      setFeedback(initialFeedback);
      setStatus(initialStatus);
      setFiles(initialFiles);
    } catch (error) {
      console.error("Error fetching assigned papers:", error);
    }
  };

  const handleFeedbackChange = (paperId, value) => {
    setFeedback((prev) => ({ ...prev, [paperId]: value }));
  };

  const handleStatusChange = (paperId, value) => {
    setStatus((prev) => ({ ...prev, [paperId]: value }));
  };

  const handleFileChange = (paperId, file) => {
    setFiles((prev) => ({ ...prev, [paperId]: file }));
  };

  const submitFeedback = async (paperId) => {
    try {
      const formData = new FormData();
      formData.append("comments", feedback[paperId]);
      formData.append("status", status[paperId]);
      if (files[paperId]) {
        formData.append("file", files[paperId]);
      }

      await axios.put(
        `http://localhost:5000/api/reviewer/review-paper/${paperId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Feedback submitted successfully!");
      fetchAssignedPapers();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback");
    }
  };

  const viewPaper = (fileUrl) => {
    window.open(`http://localhost:5000${fileUrl}`, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div
      className="p-6 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517433456452-f9633a875f6f')", width : "98vw" }}
    >
      <div className="flex justify-between items-center mb-6 bg-white/80 p-4 rounded-xl shadow">
        <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="bg-white/90 p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Assigned Papers</h2>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border p-2">Title</th>
              <th className="border p-2">Author</th>
              <th className="border p-2">Feedback</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper._id} className="text-center bg-white/80">
                <td className="border p-2 font-medium">{paper.title}</td>
                <td className="border p-2">{paper.author?.name || "Unknown"}</td>

                <td className="border p-2">
                  <textarea
                    value={feedback[paper._id]}
                    onChange={(e) => handleFeedbackChange(paper._id, e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Write your feedback here..."
                  />

                  <select
                    value={status[paper._id]}
                    onChange={(e) => handleStatusChange(paper._id, e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Changes Required">Changes Required</option>
                  </select>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <UploadCloud size={18} className="text-gray-600" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(paper._id, e.target.files[0])}
                      className="w-full"
                    />
                  </label>
                </td>

                <td className="border p-2 space-y-2">
                  <button
                    onClick={() => viewPaper(paper.fileUrl)}
                    className="w-full flex justify-center items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FileText size={18} /> View Paper
                  </button>

                  <button
                    onClick={() => submitFeedback(paper._id)}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Submit Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {papers.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No papers assigned yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;

import { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, FileText, UploadCloud } from "lucide-react";
import React from "react";
import Papers from "./Papers";
import PaperCard from "../components/PaperCard";

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
      className=" min-h-screen bg-cover bg-center"
      
    >
      <div className="flex justify-center items-center mb-1 bg-white/80 p-4  shadow">
        <h1 className="text-3xl font-bold">Reviewer Dashboard</h1>
       
      </div>
       <div className="p-4">
         {papers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="space-y-3">

              <PaperCard
                paper={paper}
               
               
              />

              
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">
          No papers uploaded yet.
        </p>
      )}
       </div>
    </div>
  );
};

export default ReviewerDashboard;

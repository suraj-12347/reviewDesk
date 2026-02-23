import React, { useEffect, useState } from "react";
import { LogOut, Users, FileText, ClipboardCheck, UserCheck } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import PaperCard from "../components/PaperCard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, papersRes, reviewersRes] = await Promise.all([
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/admin/papers"),
          axiosInstance.get("/admin/reviewers"),
        ]);

        setUsers(usersRes.data);
        setPapers(papersRes.data);
        setReviewers(reviewersRes.data);
        console.log("pap  ",papersRes.data)
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const assignReviewer = async () => {
    if (!selectedPaper || !selectedReviewer) {
      alert("Select both paper and reviewer");
      return;
    }

    try {
      await axiosInstance.put("/admin/assign-reviewer", {
        paperId: selectedPaper,
        reviewerId: selectedReviewer,
        status: "pending",
      });

      alert("Reviewer assigned");
      window.location.reload(); // quick fix, better: refetch only papers
    } catch (error) {
      console.error("Assign Error:", error);
    }
  };

  const updatePaperStatus = async (paperId, status) => {
    try {
      await axiosInstance.put("/admin/update-status", { paperId, status });
      alert(`Paper ${status}`);
      window.location.reload();
    } catch (error) {
      console.error("Status Update Error:", error);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (

    <div className="flex flex-col">
       <div className="flex justify-center items-center mb-1 bg-white p-4  shadow">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-blue-600" />
          Admin Dashboard
        </h1>

        
      </div>
       <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/bg.avif')" }}
    >
      {/* HEADER */}
     

     

      

      {/* ASSIGN SECTION */}
      {papers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="space-y-3">

              <PaperCard
                paper={paper}
                reviews={paper.reviews}
                user={user}
                updatePaperStatus={updatePaperStatus}
               
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

export default AdminDashboard;


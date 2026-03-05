import React, { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import PaperCard from "../components/PaperCard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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

        console.log("papers:", papersRes.data);
        console.log("status:", papersRes.data.map((p) => p.status));
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updatePaperStatus = async (paperId, status) => {
    try {
      await axiosInstance.put("/admin/update-status", { paperId, status });
      alert(`Paper ${status}`);
      window.location.reload();
    } catch (error) {
      console.error("Status Update Error:", error);
    }
  };

  const filteredPapers = papers.filter((paper) => {
    if (activeFilter === "all") return true;

    if (activeFilter === "reuploaded") {
      return paper.reuploadCount > 0;
    }

    return paper?.status?.toLowerCase() === activeFilter;
  });

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">

      {/* HEADER */}
      <div className="flex justify-center items-center bg-white p-4 ">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-blue-600" />
          Admin Dashboard
        </h1>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex justify-center gap-4 py-3 bg-white shadow-bottom-sm flex-wrap">

        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded shadow ${
            activeFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveFilter("pending")}
          className={`px-4 py-2 rounded shadow ${
            activeFilter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setActiveFilter("accepted")}
          className={`px-4 py-2 rounded shadow ${
            activeFilter === "accepted"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Accepted
        </button>

        <button
          onClick={() => setActiveFilter("rejected")}
          className={`px-4 py-2 rounded shadow ${
            activeFilter === "rejected"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Rejected
        </button>

        <button
          onClick={() => setActiveFilter("reuploaded")}
          className={`px-4 py-2 rounded shadow ${
            activeFilter === "reuploaded"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Reuploaded
        </button>

      </div>

      {/* SCROLLABLE PAPERS SECTION */}
      <div
        className="flex-1 overflow-y-auto bg-cover bg-center p-6 scroll1"
        style={{ backgroundImage: "url('/bg.avif')" }}
      >

        {filteredPapers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {filteredPapers.map((paper) => (
              <div key={paper._id}>
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
          <p className="text-gray-700 text-lg text-center mt-10">
            No papers found for this filter.
          </p>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
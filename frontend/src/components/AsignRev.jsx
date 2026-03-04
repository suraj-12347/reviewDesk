import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { UserCheck } from "lucide-react";

const AsignRev = () => {
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        const [papersRes, reviewersRes] = await Promise.all([
          axiosInstance.get("/admin/papers"),
          axiosInstance.get("/admin/reviewers"),
        ]);

        setPapers(Array.isArray(papersRes.data) ? papersRes.data : []);
        setReviewers(Array.isArray(reviewersRes.data) ? reviewersRes.data : []);
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // FILTER → Unassigned OR Reuploaded
 const filteredPapers = papers;
  // Selected paper object
  const selectedPaperData = papers.find(
    (paper) => paper._id === selectedPaper
  );

  // ASSIGN FUNCTION
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

      alert("Reviewer assigned successfully");

      // Update local state
     setPapers((prev) =>
  prev.map((paper) =>
    paper._id === selectedPaper
      ? { ...paper, assignedReviewers: [selectedReviewer], reuploadCount: 0 }
      : paper
  )
);

      setSelectedPaper("");
      setSelectedReviewer("");
    } catch (error) {
      console.error("Assign Error:", error);
      alert("Assignment failed");
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-600">Loading...</div>;
  }

  return (
    <div className="w-full p-10 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-3xl shadow-xl">
        {/* Title */}
        <h2 className="text-3xl font-bold text-blue-600 mb-8 flex items-center gap-2">
          <UserCheck className="text-blue-600" />
          Assign Reviewer
        </h2>

        {/* Assignment Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Paper Dropdown */}
          <select
            className="bg-gray-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
          >
            <option value="">Select Paper</option>

           {filteredPapers.map((paper) => {
  const isAssigned =
    paper.assignedReviewers &&
    paper.assignedReviewers.length > 0;

  return (
    <option key={paper._id} value={paper._id} className=" outline-node p-2 gap-2 shadow-lg border-node  ">
      <li className=" shadow-lg flex justify-between items-center bg-blue-500 ">{paper.title} ({isAssigned ? "Assigned" : "Not Assigned"})</li>
    </option>
  );
})}
          </select>

          {/* Reviewer Dropdown */}
          <select
            className="bg-gray-50 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
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
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
          >
            Assign
          </button>
        </div>

        {/* ================= DISPLAY SECTION ================= */}

        {/* CASE 1 → No paper selected */}
        {!selectedPaper && filteredPapers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <div
                key={paper._id}
                className="bg-gray-50 p-6 rounded-2xl shadow-md"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {paper.title}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Category: {paper.category?.name || "N/A"}
                </p>

                {!paper.assignedReviewers ||
                paper.assignedReviewers.length === 0 ? (
                  <p className="text-red-500 mt-2 font-medium">
                    Not Assigned
                  </p>
                ) : (
                  <p className="text-orange-500 mt-2 font-medium">
                    Reuploaded
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CASE 2 → Paper Selected */}
        {selectedPaper && selectedPaperData && (
          <div className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-md">
            <h3 className="font-semibold text-lg text-gray-800">
              {selectedPaperData.title}
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Category: {selectedPaperData.category?.name || "N/A"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Status: {selectedPaperData.status}
            </p>

            {/* Assignment Info */}
            {!selectedPaperData.assignedReviewers ||
            selectedPaperData.assignedReviewers.length === 0 ? (
              <p className="text-red-500 mt-2 font-medium">
                Not Assigned
              </p>
            ) : (
              <div className="mt-2">
                <p className="text-blue-600 font-medium">
                  Previously Assigned To:
                </p>

                {selectedPaperData.assignedReviewers.map((revId) => {
                  const reviewer = reviewers.find(
                    (r) => r._id === revId
                  );
                  return (
                    <p key={revId} className="text-sm text-gray-600">
                      {reviewer?.name || "Unknown Reviewer"}
                    </p>
                  );
                })}
              </div>
            )}

            {selectedPaperData.reuploadCount > 0 && (
              <p className="text-orange-500 mt-2 font-medium">
                Reuploaded ({selectedPaperData.reuploadCount} times)
              </p>
            )}
          </div>
        )}

        {/* CASE 3 → No eligible papers */}
        {!selectedPaper && filteredPapers.length === 0 && (
          <p className="text-gray-500">
            No papers available for assignment.
          </p>
        )}
      </div>
    </div>
  );
};

export default AsignRev;
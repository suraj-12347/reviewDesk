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
        console.log("paperr  ",reviewersRes.data)
      } catch (error) {
        console.error("Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedPaperData = papers.find((paper) => paper._id === selectedPaper);

  // Filter reviewers based on selected paper category
  const filteredReviewers = selectedPaperData
    ? reviewers.filter(
        (rev) =>
          rev.reviewerCategory?.mainCategory?._id.toString() ===
          selectedPaperData.category?._id.toString() &&rev.reviewerCategory?.subCategory ===
          selectedPaperData.subCategory
      )
    : reviewers;

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

  if (loading) return <div className="p-10 text-gray-600">Loading...</div>;

  return (
    <div className="w-full p-10 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-3xl shadow-xl">
       <h2 className="text-3xl font-bold text-blue-600 mb-8 flex flex-wrap items-center gap-2">
  <UserCheck className="text-blue-600" />
  Assign Reviewer
</h2>

{/* Assignment Controls */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
  {/* Paper Dropdown */}
  <select
    className="bg-gray-50 px-4 py-3 text-base rounded-xl focus:ring-2 focus:ring-blue-600 outline-none w-full"
    value={selectedPaper}
    onChange={(e) => setSelectedPaper(e.target.value)}
  >
    <option value="">Select Paper</option>
    {papers.map((paper) => {
      const isAssigned =
        paper.assignedReviewers && paper.assignedReviewers.length > 0;
      return (
        <option key={paper._id} value={paper._id}>
          {paper.title} ({isAssigned ? "Assigned" : "Not Assigned"})
        </option>
      );
    })}
  </select>

  {/* Reviewer Dropdown */}
  <select
    className="bg-gray-50 px-4 py-3 text-base rounded-xl focus:ring-2 focus:ring-blue-600 outline-none w-full"
    value={selectedReviewer}
    onChange={(e) => setSelectedReviewer(e.target.value)}
  >
    <option value="">Select Reviewer</option>
    {filteredReviewers.length > 0 ? (
      filteredReviewers.map((rev) => (
        <option key={rev._id} value={rev._id}>
          {rev.name} ({rev.reviewerCategory?.mainCategory?.name} →{" "}
          {rev.reviewerCategory?.subCategory})
        </option>
      ))
    ) : (
      <option value="" disabled>
        No reviewers for this category
      </option>
    )}
  </select>

  {/* Assign Button */}
  <button
    onClick={assignReviewer}
    className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition w-full md:w-auto"
  >
    Assign
  </button>
</div>
        {/* Selected Paper Details */}
        {selectedPaperData && (
          <div className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-md">
            <h3 className="font-semibold text-lg text-gray-800">
              {selectedPaperData.title}
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Category: {selectedPaperData.category?.name || "N/A"}
            </p>
             <p className="text-sm text-gray-500 mt-2">
                  SubCategory: {selectedPaperData.subCategory || "N/A"}
                </p>

            <p className="text-sm text-gray-500 mt-1">
              Status: {selectedPaperData.status}
            </p>

            {!selectedPaperData.assignedReviewers ||
            selectedPaperData.assignedReviewers.length === 0 ? (
              <p className="text-red-500 mt-2 font-medium">Not Assigned</p>
            ) : (
              <div className="mt-2">
                <p className="text-blue-600 font-medium">Previously Assigned To:</p>
                {selectedPaperData.assignedReviewers.map((revId) => {
                  const reviewer = reviewers.find((r) => r._id === revId);
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

        {/* Display All Papers */}
        {!selectedPaper && papers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div key={paper._id} className="bg-gray-50 p-6 rounded-2xl shadow-md">
                <h3 className="font-semibold text-lg text-gray-800">{paper.title}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Category: {paper.category?.name || "N/A"}
                </p>
                 <p className="text-sm text-gray-500 mt-2">
                  SubCategory: {paper.subCategory || "N/A"}
                </p>
                {!paper.assignedReviewers ||
                paper.assignedReviewers.length === 0 ? (
                  <p className="text-red-500 mt-2 font-medium">Not Assigned</p>
                ) : (
                  <p className="text-orange-500 mt-2 font-medium">Reuploaded</p>
                )}
              </div>
            ))}
          </div>
        )}

        {!selectedPaper && papers.length === 0 && (
          <p className="text-gray-500">No papers available for assignment.</p>
        )}
      </div>
    </div>
  );
};

export default AsignRev;
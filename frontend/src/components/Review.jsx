import { useEffect, useState } from "react";
import axios from "axios";
import { FileText } from "lucide-react";
import React from "react";
import axiosInstance from "../utils/axiosInstance";

const API = "http://localhost:5000/api/reviewer";

const Review = () => {
  const [papers, setPapers] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [files, setFiles] = useState({});
  const [evaluation, setEvaluation] = useState({});
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const reviewerId = token
    ? JSON.parse(atob(token.split(".")[1]))._id
    : null;

  useEffect(() => {
    fetchAssignedPapers();
  }, []);

  const fetchAssignedPapers = async () => {
    try {
      const response = await axiosInstance.get(`/reviewer/assigned-papers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = response.data
        .filter((paper) => paper.status !== "Accepted")
        .sort((a, b) => {
          const aReviewed = a.reviews?.some(
            (r) => String(r.reviewer) === String(reviewerId)
          );
          const bReviewed = b.reviews?.some(
            (r) => String(r.reviewer) === String(reviewerId)
          );

          if (aReviewed && !bReviewed) return 1;
          if (!aReviewed && bReviewed) return -1;

          return new Date(b.createdAt) - new Date(a.createdAt);
        });

      const initFeedback = {};
      const initFiles = {};
      const initEvaluation = {};

      sorted.forEach((paper) => {
        initFeedback[paper._id] = "";
        initFiles[paper._id] = null;

        initEvaluation[paper._id] = {
          originality: { score: 1, comment: "" },
          technicalQuality: { score: 1, comment: "" },
          methodology: { score: 1, comment: "" },
          clarity: { score: 1, comment: "" },
          relevance: { score: 1, comment: "" },
          literatureReview: { score: 1, comment: "" },
          overallRecommendation: "Accept",
        };
      });

      setPapers(sorted);
      setFeedback(initFeedback);
      setFiles(initFiles);
      setEvaluation(initEvaluation);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleEvaluationChange = (paperId, field, key, value) => {
    setEvaluation((prev) => ({
      ...prev,
      [paperId]: {
        ...prev[paperId],
        [field]: {
          ...prev[paperId][field],
          [key]: value,
        },
      },
    }));
  };

  const handleOverallRecommendationChange = (paperId, value) => {
    setEvaluation((prev) => ({
      ...prev,
      [paperId]: {
        ...prev[paperId],
        overallRecommendation: value,
      },
    }));
  };

  const submitFeedback = async (paperId) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("comments", feedback[paperId]);
      formData.append(
        "evaluation",
        JSON.stringify(evaluation[paperId])
      );

      if (files[paperId]) {
        formData.append("file", files[paperId]);
      }

      await axios.put(`${API}/review-paper/${paperId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Review submitted successfully!");
      fetchAssignedPapers();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const viewPaper = (fileUrl) => {
    window.open(`http://localhost:5000${fileUrl}`, "_blank");
  };

  const getStatusStyle = (paperStatus) => {
    switch (paperStatus) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Reviewing":
        return "bg-blue-100 text-blue-700";
      case "Revisions":
        return "bg-orange-100 text-orange-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Accepted":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {papers.length > 0 ? (
          papers.map((paper) => {
            const isFinalized =
              paper.status === "Accepted" ||
              paper.status === "Rejected";

            return (
              <div
                key={paper._id}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-blue-600 text-lg font-semibold">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Author: {paper.author?.name || "Unknown"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium h-10 w-25 flex items-center justify-center ${getStatusStyle(
                      paper.status
                    )}`}
                  >
                    {paper.status}
                  </span>
                </div>

                {/* Evaluation Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "originality",
                    "technicalQuality",
                    "methodology",
                    "clarity",
                    "relevance",
                    "literatureReview",
                  ].map((field) => (
                    <div key={field} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium capitalize">
                        {field}
                      </p>

                      <select
                        value={evaluation[paper._id]?.[field]?.score}
                        onChange={(e) =>
                          handleEvaluationChange(
                            paper._id,
                            field,
                            "score",
                            Number(e.target.value)
                          )
                        }
                        className="w-full mt-1 p-2 rounded"
                        disabled={isFinalized}
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>

                      <textarea
                        rows={2}
                        placeholder="Comment"
                        value={
                          evaluation[paper._id]?.[field]?.comment
                        }
                        onChange={(e) =>
                          handleEvaluationChange(
                            paper._id,
                            field,
                            "comment",
                            e.target.value
                          )
                        }
                        className="w-full mt-2 p-2 rounded"
                        disabled={isFinalized}
                      />
                    </div>
                  ))}
                </div>

                {/* Overall Recommendation */}
                <div className="mt-4">
                  <label className="block font-medium mb-1">
                    Overall Recommendation
                  </label>
                  <select
                    value={evaluation[paper._id]?.overallRecommendation}
                    onChange={(e) =>
                      handleOverallRecommendationChange(
                        paper._id,
                        e.target.value
                      )
                    }
                    className="w-full p-3 rounded bg-gray-100"
                    disabled={isFinalized}
                  >
                    <option value="Accept">Accept</option>
                    <option value="Minor Revision">
                      Minor Revision
                    </option>
                    <option value="Major Revision">
                      Major Revision
                    </option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>

                {/* Overall Feedback */}
                <textarea
                  rows={3}
                  placeholder="Overall feedback..."
                  value={feedback[paper._id]}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [paper._id]: e.target.value,
                    }))
                  }
                  className="w-full mt-4 p-3 rounded bg-gray-100"
                  disabled={isFinalized}
                />

                {/* File Upload */}
                <div className="mt-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setFiles((prev) => ({
                        ...prev,
                        [paper._id]: e.target.files[0],
                      }))
                    }
                    disabled={isFinalized}
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => viewPaper(paper.fileUrl)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    <FileText size={16} className="inline mr-1" />
                    View Paper
                  </button>

                  <button
                    disabled={loading || isFinalized}
                    onClick={() => submitFeedback(paper._id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    {isFinalized
                      ? "Finalized"
                      : loading
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">
            No papers assigned.
          </p>
        )}
      </div>
    </div>
  );
};

export default Review;
import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MoreVertical, Users, Eye, Paperclip, ArrowDownToLine } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Reviewing: "bg-blue-100 text-blue-700",
  Revisions: "bg-orange-100 text-orange-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const viewPaper = (fileUrl) => {
  window.open(`http://localhost:5000${fileUrl}`, "_blank");
};

const PaperCard = ({
  paper,
  user,
  onDelete,
  updatePaperStatus,
  reviews,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthors, setShowAuthors] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [plagFile, setPlagFile] = useState(null);
  const [plagPercent, setPlagPercent] = useState("");
  const [overallFeedback, setOverallFeedback] = useState("");

  const [showReviewList, setShowReviewList] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [reuploadFile, setReuploadFile] = useState(null);

  const menuRef = useRef(null);
  const authorsRef = useRef(null);
  const reviewRef = useRef(null);
  const feedbackRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isAuthor = user?.role === "user" && user.id === paper?.author?._id;

  const canReupload =
    paper?.status === "Revisions" &&
    (paper?.reuploadCount ?? 0) < 2 &&
    isAuthor;

  const formatDate = (date) => {
    if (!date) return "12 Feb 2026";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ SINGLE CLEAN useEffect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (authorsRef.current && !authorsRef.current.contains(e.target)) setShowAuthors(false);
      if (reviewRef.current && !reviewRef.current.contains(e.target)) setShowReviewList(false);
      if (feedbackRef.current && !feedbackRef.current.contains(e.target)) setShowFeedback(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ REVIEW SUBMIT (AXIOS)
  const handleReviewSubmit = async () => {
    

    try {
      const formData = new FormData();

      if (plagFile) {
        formData.append("file", plagFile);
      }

      formData.append("plagPercent", plagPercent);
      formData.append("overallFeedback", overallFeedback);
      formData.append("status", selectedStatus);

      await axiosInstance.post(`/papers/update-review/${paper._id}`, formData);

      updatePaperStatus(paper._id, selectedStatus);

      alert("Review submitted");

      setShowReviewForm(false);
      setPlagFile(null);
      setPlagPercent("");
      setOverallFeedback("");

    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    }
  };

  // ✅ REUPLOAD (AXIOS)
  const handleReuploadClick = async () => {
    if (!reuploadFile) {
      alert("Select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", reuploadFile);

      await axiosInstance.post(`/papers/reupload/${paper._id}`, formData);

      alert("Reuploaded successfully");
      setReuploadFile(null);

    } catch (err) {
      console.error(err);
      alert("Reupload failed");
    }
  };

  return (
    <>
      <div className="w-full bg-white shadow-md hover:shadow-lg transition p-4 rounded-xl relative">

        {/* TOP */}
        <div className="flex justify-between items-start">

          <div>
            <h4 className="text-blue-600 font-semibold line-clamp-1">
              {paper?.title}
            </h4>
            <span className="text-sm text-gray-600">
              {formatDate(paper?.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">

            {/* AUTHORS */}
            {isAdmin && (
              <div className="relative" ref={authorsRef}>
                <div
                  onClick={() => setShowAuthors(!showAuthors)}
                  className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <Users size={16} />
                </div>

                {showAuthors && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg border rounded-md p-3 z-20">

                    <p className="text-xs text-gray-500">Main Author</p>
                    <p className="font-semibold text-blue-600">
                      {paper?.author?.name}
                    </p>

                    <div className="border-t my-2"></div>

                    <p className="text-xs text-gray-500">Sub Authors</p>
                    {paper?.subAuthors?.length > 0 ? (
                      paper.subAuthors.map((a, i) => (
                        <p key={i} className="text-sm">• {a}</p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">None</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MENU */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-md w-40 z-10">

                  <button
                    onClick={() => viewPaper(paper.fileUrl)}
                    className="w-full px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    View Paper
                  </button>

                  {isAuthor && (
                    <button
                      onClick={() => onDelete(paper._id)}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      {["Accepted", "Revisions", "Rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setShowReviewForm(true);
                          }}
                          className={`w-full px-4 py-2 text-sm hover:bg-gray-50 ${
                            status === "Accepted"
                              ? "text-green-600"
                              : status === "Revisions"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* STATUS */}
        <div className="mt-3">
          <span className={clsx("px-3 py-1 rounded-full text-xs font-medium", STATUS_STYLES[paper?.status] || "bg-gray-100 text-gray-600")}>
            {paper?.status}
          </span>
        </div>

       <div className="w-full border-t border-gray-200 my-4" />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex gap-5 items-center">
          {/* Reviews (Admin only) */}
          {isAdmin && (
            <div className="relative" ref={reviewRef}>
              <div
                onClick={() => setShowReviewList(!showReviewList)}
                className="flex gap-1 items-center cursor-pointer"
              >
                <Eye size={16} />
                <span>{reviews?.length ?? 0}</span>
              </div>


              {showReviewList && (
  <div className="absolute mt-2 w-80 bg-white shadow-lg rounded border z-20 max-h-72 overflow-auto p-3">
    {reviews?.length > 0 ? (
      reviews.map((review, index) => (
        <div
          key={review._id}
          className="border-b last:border-none py-2 text-sm flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              Reviewer: {review?.reviewer?.name || "Unknown"}
            </p>
            <p
              className={`font-medium ${
                review.status === "Approved"
                  ? "text-green-600"
                  : review.status === "Rejected"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              Status: {review.status}
            </p>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setSelectedReview(index)}
            className=" h-8 w-20 rounded-lg text-xs  font-semibold  bg-blue-500  text-white hover:bg-blue-600"
          >
            View Details
          </button>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-sm">No reviews available</p>
    )}
  </div>
)}
            
       {selectedReview !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ">
    <div className="bg-white w-full max-w-md max-h-[80vh] overflow-auto rounded-xl p-6 relative shadow-2xl border border-gray-200 reviews-details">

      {/* Close Button */}
      <button
        onClick={() => setSelectedReview(null)}
        className="absolute top-1 right-2 text-gray-500 hover:text-black text-lg font-bold"
      >
        ✕
      </button>

      {/* Reviewer & Status */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <h2 className=" text-gray-700 font-bold text-lg">Reviewer: </h2>
          <h2 className="font-bold text-blue-600  text-lg">
            {reviews[selectedReview]?.reviewer?.name || "Unknown"}
          </h2>
        </div>
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold",
            reviews[selectedReview]?.status === "Approved"
              ? "bg-green-100 text-green-700"
              : reviews[selectedReview]?.status === "Rejected"
              ? "bg-red-100 text-red-700"
              : reviews[selectedReview]?.status === "Changes Required"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          )}
        >
          {reviews[selectedReview]?.status}
        </span>
      </div>

      {/* Evaluation Points */}
      {reviews[selectedReview]?.evaluation &&
        Object.entries(reviews[selectedReview].evaluation).map(([key, val]) => {
          if (typeof val === "object" && val.score !== undefined) {
            return (
              <div key={key} className="mb-4">
                {/* Title + Score */}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-blue-600 capitalize font-semibold">{key}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                    {val.score}/5
                  </span>
                </div>
                {/* Comment Box */}
                {val.comment && (
                  <div className="bg-white border border-gray-300 rounded p-2 text-gray-700 text-sm break-words">
                    {val.comment}
                  </div>
                )}
              </div>
            );
          } else if (key === "overallRecommendation") {
            return (
              <div key={key} className="mb-4">
                <span className="font-medium text-blue-600">Overall Recommendation:</span>
                <div className="bg-white border border-gray-300 rounded p-2 text-gray-700 text-sm break-words mt-1">
                  {val}
                </div>
              </div>
            );
          }
          return null;
        })}

      {/* General Comments */}
      {reviews[selectedReview]?.comments && (
        <div className="mb-4">
          <span className="font-medium text-blue-600">Comments:</span>
          <div className="bg-white border border-gray-300 rounded p-3 text-gray-700 text-sm mt-1 break-words">
            {reviews[selectedReview]?.comments}
          </div>
        </div>
      )}

      {/* Feedback File */}
      {reviews[selectedReview]?.feedbackFileUrl && (
        <a
          href={reviews[selectedReview].feedbackFileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download Feedback
        </a>
      )}
    </div>
  </div>
)}
            </div>

            
          )}

                      

          {/* Feedback */}
          <div className="relative" ref={feedbackRef}>
            <div
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex gap-1 items-center cursor-pointer"
            >
              <Paperclip size={16} />
            </div>

            {showFeedback && (
              <div className="absolute mt-2 w-56 bg-white shadow-lg rounded border z-10 max-h-60 overflow-auto">
                {reviews?.length > 0 ? (
                  reviews.map((review, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (review?.feedbackFileUrl) {
                          window.open(
                            `${import.meta.env.VITE_API_URL}${review.feedbackFileUrl}`,
                            "_blank"
                          );
                        }
                      }}
                      className="w-full text-left px-3 py-2 cursor-pointer text-sm hover:bg-gray-100"
                    >
                      <div className="w-full flex justify-between items-center">
                        <p>Feedback {index + 1}</p>
                        <ArrowDownToLine size={16} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No feedback available
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <span>
              {paper?.reuploadCount ?? 0}/2 Attempts
            </span>
          </div>
        </div>

        {/* Author Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          {paper?.author?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
        

        {/* REUPLOAD */}
        {canReupload && (
          <div className="flex flex-col gap-2 mt-4">
            <input type="file" onChange={(e) => setReuploadFile(e.target.files[0])} />
            <button
              onClick={handleReuploadClick}
              className="bg-orange-500 text-white py-2 rounded"
            >
              Reupload
            </button>
          </div>
        )}

      </div>

      {/* MODAL */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setShowReviewForm(false)}
              className="absolute top-2 right-3"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold mb-3">
              {selectedStatus} Paper
            </h2>

            <input type="file" onChange={(e) => setPlagFile(e.target.files[0])} className="mb-3 w-full" />

            <input
              type="number"
              placeholder="Plagiarism %"
              value={plagPercent}
              onChange={(e) => setPlagPercent(e.target.value)}
              className="mb-3 w-full border p-2 rounded"
            />

            <textarea
              placeholder="Overall Feedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              className="mb-3 w-full border p-2 rounded"
            />

            <button
              onClick={handleReviewSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Submit
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default PaperCard;
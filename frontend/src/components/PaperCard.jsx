import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MoreVertical, Paperclip, Eye, ArrowDownToLine } from "lucide-react";
import ReviewsDetails from "./ReviewsDetails";

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
  user, // ✅ parent-driven user
  reviews, // ✅ parent-driven reviews
  onDelete,
  updatePaperStatus,
  handleReupload,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);
  const [reuploadFile, setReuploadFile] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const isAuthor = paper?.author?._id === user?._id;

  console.log("reviews in card ", reviews)

  const canReupload =
    paper?.status === "Revisions" &&
    (paper?.reuploadCount ?? 0) < 2 &&
    isUser &&
    isAuthor;

  const reviewRef = useRef(null);
  const feedbackRef = useRef(null);
  const menuRef = useRef(null);

  const formatDate = (date) => {
    if (!date) return "12 Feb 2026";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (reviewRef.current && !reviewRef.current.contains(e.target)) {
        setShowReviewList(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(e.target)) {
        setShowFeedback(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReuploadClick = () => {
    if (!reuploadFile) {
      alert("Select a file first.");
      return;
    }
    handleReupload(paper._id, reuploadFile);
  };

  return (
    <div className="w-full bg-white shadow-md hover:shadow-lg transition p-4 rounded-xl relative">
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-blue-600 font-semibold line-clamp-1">
            {paper?.title || "AI Research Paper"}
          </h4>
          <span className="text-sm text-gray-600">
            {formatDate(paper?.createdAt)}
          </span>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-md w-40 z-10">
              <button
                onClick={() => viewPaper(paper.fileUrl)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                View Paper
              </button>

              {isAuthor && (
                <button
                  onClick={() => onDelete(paper._id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
                >
                  Delete
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => updatePaperStatus(paper._id, "Accepted")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updatePaperStatus(paper._id, "Revisions")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-600 transition"
                  >
                    Revision
                  </button>
                  <button
                    onClick={() => updatePaperStatus(paper._id, "Rejected")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status & Reupload Count */}
      <div className="mt-3 flex gap-4">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            STATUS_STYLES[paper?.status] || "bg-gray-100 text-gray-600"
          )}
        >
          {paper?.status || "Pending"}
        </span>
        {paper?.reuploadCount > 0 && (
          <span
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
            )}
          >
            Reuploads: {paper?.reuploadCount ?? 0}
          </span>
        )}
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

      {/* Reupload Section (ONLY USER + AUTHOR) */}
      {canReupload && (
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="file"
            onChange={(e) => setReuploadFile(e.target.files[0] || null)}
            className="border p-2 rounded text-sm"
          />
          <button
            onClick={handleReuploadClick}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded hover:scale-105 transition"
          >
            Reupload
          </button>
        </div>
      )}
    </div>
  );
};

export default PaperCard;







{/* Modal for Review Details */}

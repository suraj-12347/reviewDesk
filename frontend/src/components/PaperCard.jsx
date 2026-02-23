import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MoreVertical, Paperclip, MessageSquare ,Eye,ArrowDownToLine } from "lucide-react";

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
  onDownload,
  updatePaperStatus,
  handleReupload,
  reviews,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.role === "admin";

  const reviewRef = useRef(null);
  const feedbackRef = useRef(null); 
  const menuRef = useRef(null);
  console.log("reviews ", paper?.fileUrl)

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
  return () =>
    document.removeEventListener("mousedown", handleClickOutside);
}, []);
  const handleDelete = () => {
    if (window.confirm("Delete this paper?")) {
      onDelete(paper._id);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white shadow-md hover:shadow-lg transition p-4 rounded-xl relative">

      {/* Top Section */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-blue-600 font-semibold line-clamp-1 ">
            {paper?.title || "AI Research Paper"}
          </h4>
          <span className="text-sm text-gray-600">
            {formatDate(paper?.createdAt)}
          </span>
        </div>

        {/* Three Dot Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 transition"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-md w-40 z-10">

              {/* Download */}
              <button
                onClick={() => viewPaper(paper.fileUrl)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                Download
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
              >
                Delete
              </button>

              {/* Admin Options */}
              {user?.role === "admin" && (
                <>
                  <button
                    onClick={() =>
                      updatePaperStatus(paper._id, "Accepted")
                    }
                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      updatePaperStatus(paper._id, "Revisions")
                    }
                    className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-600 transition"
                  >
                    Revision
                  </button>

                  <button
                    onClick={() =>
                      updatePaperStatus(paper._id, "Rejected")
                    }
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

      {/* Status Badge */}
      <div className="mt-3">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            STATUS_STYLES[paper?.status] || "bg-gray-100 text-gray-600"
          )}
        >
          {paper?.status || "Pending"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200 my-4" />

      {/* Stats Section */}
      <div className="relative flex items-center justify-between">
  <div className="flex gap-5 items-center text-sm text-gray-600">

    {/* 👁 Assigned Reviewer */}
    <div className="relative" ref={reviewRef}>
  <div
   onClick={() => {
  if (isAdmin) {
    setShowReviewList(!showReviewList);
    setShowFeedback(false);
  }
}}
    className={`flex gap-1 items-center ${
      isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-50"
    }`}
  >
    <Eye size={16} />
    <span>{paper?.reviews?.length ?? 0}</span>
  </div>

  
</div>

{showReviewList && (
  <div className="absolute mt-2 w-80 bg-white shadow-lg rounded border z-20 max-h-72 overflow-auto p-3">
    {paper?.reviews?.length > 0 ? (
      paper.reviews.map((review, index) => (
        <div
          key={review._id}
          className="border-b last:border-none py-2 text-sm "
        >
          <p className="font-semibold">
            Reviewer: {review.reviewerName || review.reviewer}
          </p>

          <p className="text-gray-600">
            Comment: {review.comments || "No comment"}
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
      ))
    ) : (
      <p className="text-gray-500 text-sm">No reviews available</p>
    )}
  </div>
)}




    {/* 📎 Feedback List */}
    <div className="relative" ref={feedbackRef}>
      <div
        onClick={() => {
        setShowFeedback(!showFeedback);
        setShowReviewList(false);
         }}
        className="relative group flex gap-1 items-center cursor-pointer"
      >
        <Paperclip size={16} />

        {/* Tooltip */}
        <div className="absolute bottom-6 left-0 hidden group-hover:block bg-white border text-green-600 text-xs px-2 py-1 rounded">
          Download Feedback
        </div>
      </div>

      {/* Dropdown */}
     {showFeedback && (
  <div className="absolute mt-2 w-56 bg-white shadow-lg rounded border z-10 max-h-60 overflow-auto">
    {paper?.reviews?.length > 0 ? (
      paper.reviews.map((review, index) => (
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
          className="w-1/2 text-left px-3 py-2 cursor-pointer text-sm hover:bg-gray-100"
        >
          <div className=" w-full flex justify-between align-center p2">
            <p>Feedback {index + 1} </p>
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

    {/* Attempts */}
    <div>
      <span>{paper?.reuploadCount ?? 1}/3 Attempts</span>
    </div>
  </div>

  {/* Author Avatar */}
  <div className="relative group">
  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium cursor-pointer">
    {paper?.author?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  <div className="absolute bottom-10 left-1/2 -translate-x-1/2
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                  bg-white border text-green-600 text-xs
                  px-2 py-1 rounded whitespace-nowrap z-20">
    {paper?.author?.name || "You"}
  </div>
</div>
</div>
      
              {paper.status === "Revisions" &&
                paper.reuploadCount < 3 && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      onChange={(e) =>
                        setReuploadFiles((prev) => ({
                          ...prev,
                          [paper._id]: e.target.files[0],
                        }))
                      }
                      className="border p-2 rounded text-sm mt-3"
                    />

                    <button
                      onClick={() => handleReupload(paper)}
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
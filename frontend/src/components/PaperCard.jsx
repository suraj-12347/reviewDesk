import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  MoreVertical,
  Paperclip,
  Eye,
  ArrowDownToLine,
} from "lucide-react";

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
  onDelete,
  updatePaperStatus,
  handleReupload,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);
  const [reuploadFile, setReuploadFile] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isAdmin = currentUser?.role === "admin";
  const isUser = currentUser?.role === "user";
 
  

  const canReupload =
    paper?.status === "Revisions" &&
    paper?.reuploadCount < 2 &&
    isUser 
   

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (window.confirm("Delete this paper?")) {
      onDelete(paper._id);
    }
  };

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
                Download
              </button>

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
                >
                  Delete
                </button>
              )}

              {isAdmin && (
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

      {/* Status */}
      <div className="mt-3 flex gap-4">
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            STATUS_STYLES[paper?.status] ||
              "bg-gray-100 text-gray-600"
          )}
        >
          {paper?.status || "Pending"}
        </span>
       {paper?.reuploadCount>0 &&<span
  className={clsx(
    "px-3 py-1 rounded-full text-xs font-medium bg-gray-100"
  )}
>
  Reuploads: {paper?.reuploadCount ?? 0}
</span>}


      </div>

      <div className="w-full border-t border-gray-200 my-4" />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex gap-5 items-center">

          {/* Reviews (Admin only) */}
          {isAdmin && (
            <div
              className="flex gap-1 items-center cursor-pointer"
              onClick={() =>
                setShowReviewList(!showReviewList)
              }
            >
              <Eye size={16} />
              <span>{paper?.reviews?.length ?? 0}</span>
            </div>
          )}

          {/* Feedback */}
          <div
            className="flex gap-1 items-center cursor-pointer"
            onClick={() => setShowFeedback(!showFeedback)}
          >
            <Paperclip size={16} />
          </div>

          <div>
            <span>{paper?.reuploadCount ?? 0}/2 Attempts</span>
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
            onChange={(e) =>
              setReuploadFile(e.target.files[0] || null)
            }
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
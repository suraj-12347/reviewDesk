import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MoreVertical, Paperclip, MessageSquare } from "lucide-react";

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
  handleReupload
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  console.log("papap ", paper)

  const formatDate = (date) => {
    if (!date) return "12 Feb 2026";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };



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
          <h4 className="text-black font-semibold line-clamp-1">
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
      <div className="flex items-center justify-between">
        <div className="flex gap-5 items-center text-sm text-gray-600">
          <div className="flex gap-1 items-center">
            <MessageSquare size={16} />
            <span>{paper?.reviews?.length ?? 0}</span>
          </div>

          <div className="flex gap-1 items-center">
            <Paperclip size={16} />
            <span>{paper?.assets?.length ?? 0}</span>
          </div>

          <div>
            <span>{paper?.reuploadCount ?? 1}/3 Attempts</span>
          </div>
        </div>

        {/* Author Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          {paper?.author?.name?.charAt(0)?.toUpperCase() || "U"}
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
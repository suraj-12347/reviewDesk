// ReviewsDetails.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  "Changes Required": "bg-orange-100 text-orange-700",
  Rejected: "bg-red-100 text-red-700",
};

const ReviewsDetails = ({ reviews }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500 text-sm">No reviews available</p>;
  }

  return (
    <div className="space-y-2">
      {reviews.map((review, index) => (
        <div
          key={review._id}
          className="border rounded-lg shadow-sm p-3 hover:shadow-md transition cursor-pointer"
        >
          {/* Reviewer Summary */}
          <div
            className="flex justify-between items-center"
            onClick={() => toggleExpand(index)}
          >
            <div>
              <p className="font-semibold">
                {review.reviewer?.name || "Unknown Reviewer"}
              </p>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  STATUS_STYLES[review.status] || "bg-gray-100 text-gray-600"
                }`}
              >
                {review.status}
              </span>
            </div>
            <div>
              {expandedIndex === index ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </div>
          </div>

          {/* Review Details */}
          {expandedIndex === index && (
            <div className="mt-2 text-sm space-y-2 border-t pt-2">
              {/* Comments */}
              <p>
                <span className="font-medium">Comments:</span>{" "}
                {review.comments || "No comments"}
              </p>

              {/* Evaluation points */}
              {review.evaluation && (
                <div className="space-y-1">
                  {Object.entries(review.evaluation).map(([key, val]) => {
                    if (typeof val === "object" && val.score !== undefined) {
                      return (
                        <p key={key}>
                          <span className="font-medium capitalize">{key}:</span>{" "}
                          {val.score}/5 {val.comment ? `- ${val.comment}` : ""}
                        </p>
                      );
                    } else if (key === "overallRecommendation") {
                      return (
                        <p key={key}>
                          <span className="font-medium">Overall Recommendation:</span>{" "}
                          {val}
                        </p>
                      );
                    } else {
                      return null;
                    }
                  })}
                </div>
              )}

              {/* Feedback file */}
              {review.feedbackFileUrl && (
                <a
                  href={review.feedbackFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  Download Feedback
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsDetails;
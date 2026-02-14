import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";


const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [papers, setPapers] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const fetchPapers = async () => {
    if (!user || !user.userId) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/papers/my-papers?userId=${user.userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPapers(response.data);
    } catch (error) {
      console.error("Error fetching papers:", error);
      alert("Failed to fetch papers");
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const uploadPaper = async () => {
    if (!file || !title || !user?.userId) {
      alert("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("author", user.userId);

    try {
      await axios.post("http://localhost:5000/api/papers/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
         
        }
      });
      alert("Paper uploaded successfully");
      setFile(null);
      setTitle("");
      fetchPapers();
    } catch (error) {
      console.error("Error uploading paper:", error);
      alert("Failed to upload paper");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 w={98vw}"
      style={{ backgroundImage: "url('/bg.avif')", width: "98vw" }}
    >
      {/* Glass Container */}
      <div className="backdrop-blur-md bg-white/70 rounded-xl max-w-5xl mx-auto shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 drop-shadow-md">📚 User Dashboard</h1>
          <button
            onClick={() => {
              logout();
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>

        {/* Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload New Paper</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Paper Title"
            className="p-2 border border-gray-300 rounded w-full mb-3"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded w-full mb-4"
          />
          <button
            onClick={uploadPaper}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded shadow hover:scale-105 transition"
          >
            Upload Paper
          </button>
        </div>

        {/* Papers List */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📄 Your Papers</h2>
          {papers.length > 0 ? (
            <div className="space-y-6">
              {papers.map((paper) => (
                <div
                  key={paper._id}
                  className="bg-white border-l-4 border-blue-400 p-5 rounded-lg shadow flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-800">{paper.title}</p>
                      <p
                        className={`text-sm ${
                          paper.status === "Accepted"
                            ? "text-green-600"
                            : paper.status === "Rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Status: {paper.status || "Pending"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Reupload Attempts: {paper.reuploadCount}/3
                      </p>
                    </div>
                    {paper.fileUrl && (
                      <a
                        href={`http://localhost:5000${paper.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Download
                      </a>
                    )}
                  </div>

                  {/* Feedback */}
                  {paper.reviews.map((review, index) => (
                    <div key={index} className="mt-2 text-sm bg-gray-50 p-3 rounded">
                      <p className="font-medium">Reviewer {index + 1}:</p>
                      <p>Status: {review.status}</p>
                      <p>Comments: {review.comments}</p>
                      {review.feedbackFileUrl && (
                        <a
                          href={`http://localhost:5000${review.feedbackFileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 underline"
                        >
                          Download Feedback
                        </a>
                      )}
                    </div>
                  ))}

                  {/* Reupload */}
                  {paper.status === "Rejected" && paper.reuploadCount < 3 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
                      <input
                        type="file"
                        onChange={(e) => {
                          const fileObj = e.target.files[0];
                          setPapers((prevPapers) =>
                            prevPapers.map((p) =>
                              p._id === paper._id ? { ...p, newFile: fileObj } : p
                            )
                          );
                        }}
                        className="border p-2 rounded"
                      />
                      <button
                        onClick={() => {
                          if (!paper.newFile) {
                            alert("Please select a file to reupload.");
                            return;
                          }

                          const formData = new FormData();
                          formData.append("file", paper.newFile);
                          formData.append("title", paper.title);
                          formData.append("reuploadCount", paper.reuploadCount);

                          axios
                            .post(
                              `http://localhost:5000/api/papers/reupload/${paper._id}`,
                              formData,
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  "Content-Type": "multipart/form-data",
                                },
                              }
                            )
                            .then(() => {
                              alert("Paper reuploaded successfully");
                              fetchPapers();
                            })
                            .catch((error) => {
                              console.error("Reupload failed:", error);
                              alert("Failed to reupload paper");
                            });
                        }}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded hover:scale-105 transition"
                      >
                        Reupload
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-lg">No papers uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

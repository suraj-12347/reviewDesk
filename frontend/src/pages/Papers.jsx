import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import PaperCard from "../components/PaperCard";

const Papers = (props) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reuploadFiles, setReuploadFiles] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axiosInstance.get("/papers/my-papers");
      const paperData = res.data;
      console.log("paper ",paperData)

      if (Array.isArray(paperData)) {
        setPapers(paperData);
      } else if (paperData) {
        setPapers([paperData]);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error("Failed to fetch papers:", error);
    } finally {
      setLoading(false);
    }

    
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/papers/${id}`);
      setPapers((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDownload = async (fileUrl) => {
    try {
      const response = await axiosInstance.get(fileUrl, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "paper");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.patch(`/papers/status/${id}`, { status });
      fetchPapers();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const handleReupload = async (paper) => {
    const file = reuploadFiles[paper._id];

    if (!file) {
      alert("Select a file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post(
        `/papers/reupload/${paper._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Reuploaded successfully");
      fetchPapers();
    } catch (error) {
      console.error("Reupload error:", error);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading papers...</div>;
  }

  return (
    <div className="p-4 pt-0 max-w-6xl mx-auto bg-[#f3f4f6] ">
      

      {papers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="space-y-3">

              <PaperCard
                paper={paper}
                user={user}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onStatusUpdate={handleStatusUpdate}
                handleReupload={handleReupload}
              />

            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">
          No papers uploaded yet.
        </p>
      )}
    </div>
  );
};

export default Papers;
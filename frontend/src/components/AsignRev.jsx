import React,{useState} from 'react'
import { LogOut, Users, FileText, ClipboardCheck, UserCheck } from "lucide-react";

const AsignRev = () => {
     
    const [users, setUsers] = useState([]);
      const [papers, setPapers] = useState([]);
      const [reviewers, setReviewers] = useState([]);
    const [selectedReviewer, setSelectedReviewer] = useState("");
      const [selectedPaper, setSelectedPaper] = useState("");
       const [loading, setLoading] = useState(true);
        const user = JSON.parse(localStorage.getItem("user"));
      



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
    
          alert("Reviewer assigned");
          window.location.reload(); // quick fix, better: refetch only papers
        } catch (error) {
          console.error("Assign Error:", error);
        }
      };

  return (
    <div className=' w-full p-6'>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserCheck className="text-blue-500" />
          Assign Reviewer
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <select
            className="border p-2 rounded"
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
          >
            <option value="">Select Paper</option>
            {papers.map((paper) => (
              <option key={paper._id} value={paper._id}>
                {paper.title}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={selectedReviewer}
            onChange={(e) => setSelectedReviewer(e.target.value)}
          >
            <option value="">Select Reviewer</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer._id} value={reviewer._id}>
                {reviewer.name}
              </option>
            ))}
          </select>

          <button
            onClick={assignReviewer}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Assign
          </button>
        </div>
         {papers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <div key={paper._id} className="space-y-3">

              <PaperCard
                paper={paper}
                user={user}
                
              />

              {paper.status === "Rejected" &&
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
                      className="border p-2 rounded text-sm"
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
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">
          No papers uploaded yet.
        </p>
      )}
      </div>
    </div>
  )
}

export default AsignRev

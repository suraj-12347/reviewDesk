import React ,{useState} from 'react'
import { useAuth } from '../context/AuthContext';

const UploadPaper = () => {
     const { user, logout } = useAuth();
      const [papers, setPapers] = useState([]);
      const [file, setFile] = useState(null);
      const [title, setTitle] = useState("");
    






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
    <div className='p-8'>
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
      
    </div>
  )
}

export default UploadPaper

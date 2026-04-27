import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";

const UploadPaper = () => {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(false);

  // 🔥 Sub Authors State
  const [subAuthors, setSubAuthors] = useState([""]);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await axiosInstance.get("/categories");

        const formatted = res.data.map((cat) => ({
          value: cat._id,
          label: cat.name,
          subCategories: cat.subCategories || [],
        }));

        setCategories(formatted);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // ✅ Category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);

    if (category?.subCategories?.length > 0) {
      const formattedSubs = category.subCategories.map((sub) => ({
        value: sub,
        label: sub,
      }));
      setSubCategories(formattedSubs);
    } else {
      setSubCategories([]);
    }
  };

  // 🔥 Sub Author Handlers
  const handleSubAuthorChange = (index, value) => {
    const updated = [...subAuthors];
    updated[index] = value;
    setSubAuthors(updated);
  };

  const addSubAuthor = () => {
    setSubAuthors([...subAuthors, ""]);
  };

  const removeSubAuthor = (index) => {
    const updated = subAuthors.filter((_, i) => i !== index);
    setSubAuthors(updated);
  };

  const uploadPaper = async () => {
    const cleanSubAuthors = subAuthors.filter((a) => a.trim() !== "");

    if (
      !file ||
      !title ||
      !selectedCategory ||
      !selectedSubCategory ||
      cleanSubAuthors.length === 0
    ) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("author", user.userId);
    formData.append("category", selectedCategory.value);
    formData.append("subCategory", selectedSubCategory.value);
    formData.append("subAuthors", JSON.stringify(cleanSubAuthors));

    try {
      await axiosInstance.post("/papers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Paper uploaded successfully");

      // reset
      setFile(null);
      setTitle("");
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSubCategories([]);
      setSubAuthors([""]);
    } catch (error) {
      console.error("Upload Error:", error.response?.data || error);
      alert(error.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-12">
        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-blue-600">
            Publish Your Research.
            <br />
            Shape The Future.
          </h1>

          <p className="text-lg text-gray-700">
            "Great research doesn’t just inform — it transforms."
          </p>

          <p className="text-gray-500">
            Upload your paper and contribute to a growing body of knowledge.
          </p>

          <div className="h-1 w-20 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-5">

        <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-2xl">

          <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">
            Upload New Paper
          </h2>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Paper Title"
            className="p-4 bg-gray-100 rounded-xl w-full mb-5 focus:ring-2 focus:ring-blue-600 outline-none"
          />

          {/* 🔥 Sub Authors */}
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-600">
              Sub Authors
            </label>

            {subAuthors.map((author, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={author}
                  onChange={(e) =>
                    handleSubAuthorChange(index, e.target.value)
                  }
                  placeholder={`Sub Author ${index + 1}`}
                  className="p-3 bg-gray-100 rounded-xl w-full outline-none focus:ring-2 focus:ring-blue-500"
                />

                {subAuthors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubAuthor(index)}
                    className="bg-red-500 text-white px-3 rounded-lg"
                  >
                    X
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addSubAuthor}
              className="text-blue-600 font-semibold mt-2"
            >
              + Add More
            </button>
          </div>

          {/* Category */}
          <Select
            options={categories}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Search & Select Category"
            isSearchable
            isClearable
            isLoading={loadingCategories}
            className="mb-5"
          />

          {/* SubCategory */}
          <Select
            options={subCategories}
            value={selectedSubCategory}
            onChange={setSelectedSubCategory}
            placeholder={
              selectedCategory
                ? "Select Sub Category"
                : "Select Category First"
            }
            isSearchable
            isDisabled={!selectedCategory}
            className="mb-5"
          />

          {/* File */}
          <input
            type="file"
            onChange={handleFileChange}
            className="p-4 bg-gray-100 rounded-xl w-full mb-6"
          />

          <button
            onClick={uploadPaper}
            className="w-full bg-blue-600 text-white py-4 rounded-xl shadow-lg hover:scale-[1.02] transition font-semibold text-lg"
          >
            Upload Paper
          </button>

        </div>
      </div>
    </div>
  );
};

export default UploadPaper;
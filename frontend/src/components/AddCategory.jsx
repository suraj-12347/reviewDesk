import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import CategoryList from "./CategoryList";

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [mainCategory, setMainCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [showList, setShowList] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddMain = async (e) => {
    e.preventDefault();
    if (!mainCategory.trim()) return;

    try {
      await axiosInstance.post("/categories/main", {
        name: mainCategory,
      });

      toast.success("Main category added");
      setMainCategory("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding category");
    }
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !subCategory.trim()) return;

    try {
      await axiosInstance.post("/categories/sub", {
        categoryId: selectedCategory,
        subCategory,
      });

      toast.success("Sub category added");
      setSubCategory("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding sub category");
    }
  };

  return (
    <div className="min-h-screen  p-10 ">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-blue-600">
            Manage Categories
          </h1>

          <button
            onClick={() => setShowList(!showList)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-md hover:shadow-lg transition"
          >
            {showList ? "Hide Categories" : "View Categories"}

            
          </button>
        </div>

        {/*catorylist*/}
          {showList && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">
              All Categories
            </h2>

             
            {showList ? <CategoryList categories={categories} /> : <></ >}
         
          </div>
        )}

        

        {/* Add Main */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Add Main Category
          </h2>

          <form onSubmit={handleAddMain} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter category name"
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
              className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-blue-600 text-white shadow-md hover:shadow-lg transition"
            >
              Add
            </button>
          </form>
        </div>

        {/* Add Sub */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Add Sub Category
          </h2>

          <form onSubmit={handleAddSub} className="space-y-6">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select Main Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter sub category"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-600 outline-none"
              />

              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-blue-600 text-white shadow-md hover:shadow-lg transition"
              >
                Add
              </button>
            </div>
          </form>
        </div>

        {/* Category List */}
      

      </div>
    </div>
  );
};

export default AddCategory;
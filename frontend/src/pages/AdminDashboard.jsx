import React, { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import PaperCard from "../components/PaperCard";

const AdminDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  // 🔥 ADVANCED FILTER STATES
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axiosInstance.get("/admin/papers");
        setPapers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updatePaperStatus = async (paperId, status) => {
    try {
      await axiosInstance.put("/admin/update-status", { paperId, status });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 UNIQUE VALUES (DROPDOWN DATA)
  const users = [...new Set(papers.map(p => p.author?.name))];
  const orgs = [...new Set(papers.map(p => p.author?.affiliation))];
  const categories = [...new Set(papers.map(p => p.category?.name))];
  const subCategories = [...new Set(papers.map(p => p.subCategory))];
  const countries = [...new Set(papers.map(p => p.author?.country))];
  const states = [...new Set(papers.map(p => p.author?.state))];
  const districts = [...new Set(papers.map(p => p.author?.district))];
  const years = [...new Set(papers.map(p => new Date(p.createdAt).getFullYear()))];

  // 🔥 FILTER LOGIC
  const filteredPapers = papers.filter((paper) => {

    // OLD FILTER
    if (activeFilter !== "all") {
      if (activeFilter === "reuploaded") {
        if (!(paper.reuploadCount > 0)) return false;
      } else {
        if (paper?.status?.toLowerCase() !== activeFilter) return false;
      }
    }

    // 🔥 ADVANCED FILTERS
    if (selectedUser && paper.author?.name !== selectedUser) return false;
    if (selectedOrg && paper.author?.affiliation !== selectedOrg) return false;
    if (selectedCategory && paper.category?.name !== selectedCategory) return false;
    if (selectedSubCategory && paper.subCategory !== selectedSubCategory) return false;

    if (selectedCountry && paper.author?.country !== selectedCountry) return false;
    if (selectedState && paper.author?.state !== selectedState) return false;
    if (selectedDistrict && paper.author?.district !== selectedDistrict) return false;

    // DATE FILTER
    const date = new Date(paper.createdAt);

    if (selectedYear && date.getFullYear() !== Number(selectedYear)) return false;
    if (selectedMonth && date.getMonth() + 1 !== Number(selectedMonth)) return false;
    if (selectedDay && date.getDate() !== Number(selectedDay)) return false;

    return true;
  });

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col h-screen">

      {/* HEADER */}
      <div className="flex justify-center items-center bg-white p-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-blue-600" />
          Admin Dashboard
        </h1>
      </div>

      {/* 🔥 OLD FILTERS */}
      <div className="flex justify-center gap-4 py-3 bg-white flex-wrap">
        {["all", "pending", "accepted", "rejected", "reuploaded"].map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded ${
              activeFilter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔥 NEW ADVANCED FILTER ROW */}
      <div className="flex flex-wrap gap-3 justify-center p-3 bg-gray-100">

        <select onChange={e => setSelectedUser(e.target.value)} value={selectedUser}>
          <option value="">All Users</option>
          {users.map((u, i) => <option key={i}>{u}</option>)}
        </select>

        <select onChange={e => setSelectedOrg(e.target.value)} value={selectedOrg}>
          <option value="">Organisation</option>
          {orgs.map((o, i) => <option key={i}>{o}</option>)}
        </select>

        <select onChange={e => setSelectedCategory(e.target.value)} value={selectedCategory}>
          <option value="">Category</option>
          {categories.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <select onChange={e => setSelectedSubCategory(e.target.value)} value={selectedSubCategory}>
          <option value="">SubCategory</option>
          {subCategories.map((s, i) => <option key={i}>{s}</option>)}
        </select>

        <select onChange={e => setSelectedCountry(e.target.value)} value={selectedCountry}>
          <option value="">Country</option>
          {countries.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <select onChange={e => setSelectedState(e.target.value)} value={selectedState}>
          <option value="">State</option>
          {states.map((s, i) => <option key={i}>{s}</option>)}
        </select>

        <select onChange={e => setSelectedDistrict(e.target.value)} value={selectedDistrict}>
          <option value="">District</option>
          {districts.map((d, i) => <option key={i}>{d}</option>)}
        </select>

        <select onChange={e => setSelectedYear(e.target.value)} value={selectedYear}>
          <option value="">Year</option>
          {years.map((y, i) => <option key={i}>{y}</option>)}
        </select>

        <select onChange={e => setSelectedMonth(e.target.value)} value={selectedMonth}>
          <option value="">Month</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        <select onChange={e => setSelectedDay(e.target.value)} value={selectedDay}>
          <option value="">Day</option>
          {[...Array(31)].map((_, i) => (
            <option key={i} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        {/* RESET */}
        <button
          onClick={() => {
            setSelectedUser("");
            setSelectedOrg("");
            setSelectedCategory("");
            setSelectedSubCategory("");
            setSelectedCountry("");
            setSelectedState("");
            setSelectedDistrict("");
            setSelectedYear("");
            setSelectedMonth("");
            setSelectedDay("");
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Reset
        </button>

      </div>

      {/* PAPERS */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {filteredPapers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper._id}
                paper={paper}
                reviews={paper.reviews}
                user={user}
                updatePaperStatus={updatePaperStatus}
              />
            ))}
          </div>
        ) : (
          <p className="text-center mt-10 text-gray-500">No papers found</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
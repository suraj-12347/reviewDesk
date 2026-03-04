import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Country, State, City } from "country-state-city";

const AddReviewer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mainCategory: "",
    subCategory: "",
    country: "",
    state: "",
    district: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ================= LOAD INITIAL DATA ================= */

  useEffect(() => {
    setCountries(Country.getAllCountries());

    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Category load failed");
      }
    };

    fetchCategories();
  }, []);

  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= CATEGORY CHANGE ================= */

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selected = categories.find((c) => c._id === selectedId);

    setFormData((prev) => ({
      ...prev,
      mainCategory: selectedId,
      subCategory: "",
    }));

    setSubCategories(selected?.subCategories || []);
  };

  /* ================= COUNTRY CHANGE ================= */

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      state: "",
      district: "",
    }));

    setStates(State.getStatesOfCountry(countryCode));
    setDistricts([]);
  };

  /* ================= STATE CHANGE ================= */

  const handleStateChange = (e) => {
    const stateCode = e.target.value;

    setFormData((prev) => ({
      ...prev,
      state: stateCode,
      district: "",
    }));

    setDistricts(City.getCitiesOfState(formData.country, stateCode));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const {
      name,
      email,
      password,
      mainCategory,
      subCategory,
      country,
      state,
      district,
    } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !mainCategory ||
      !subCategory ||
      !country ||
      !state ||
      !district
    ) {
      return setError("All fields are required");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "/admin/register-reviewer",
        {
          name,
          email,
          password,
          country,
          state,
          district,
          reviewerCategory: {
            mainCategory,
            subCategory,
          },
        }
      );

      setMessage(res.data.message || "Reviewer added successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        mainCategory: "",
        subCategory: "",
        country: "",
        state: "",
        district: "",
      });

      setStates([]);
      setDistricts([]);
      setSubCategories([]);

    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center py-10 px-10 w-full">
      <div className="w-full h-full px-20 bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Add Reviewer !
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-2 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4 w-full">

         <div className=" gap-4 w-full  flex flex-col md:flex-row">
          <div className="flex flex-col gap-4 w-full">
           <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Reviewer name"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Reviewer email"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password (min 8 characters)"
          />

          {/* Country */}
          <select
            value={formData.country}
            onChange={handleCountryChange}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>

         </div>
          {/* State */}
         <div className="flex flex-col gap-4 w-full">
           <select
            value={formData.state}
            onChange={handleStateChange}
            disabled={!formData.country}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>

          {/* District / City */}
          <select
            value={formData.district}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                district: e.target.value,
              }))
            }
            disabled={!formData.state}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={formData.mainCategory}
            onChange={handleCategoryChange}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Main Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sub Category */}
          <select
            value={formData.subCategory}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subCategory: e.target.value,
              }))
            }
            disabled={!formData.mainCategory}
            className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Sub Category</option>
            {subCategories.map((sub, index) => (
              <option key={index} value={sub}>
                {sub}
              </option>
            ))}
          </select>
         </div>
         </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md"
          >
            {loading ? "Adding..." : "Add Reviewer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReviewer;
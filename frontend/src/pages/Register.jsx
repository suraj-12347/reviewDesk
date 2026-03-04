import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import { Country, State, City } from "country-state-city";
import axiosInstance from "../utils/axiosInstance";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [countries, setCountries] = useState([]);
const [states, setStates] = useState([]);
const [districts, setDistricts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    country: "",
    state: "",
    district: "",
    affiliation: "",
    contactNumber: "",
    reviewerCategory: {
      mainCategory: "",
      subCategory: ""
    }
  });
  //load country
  useEffect(() => {
  setCountries(Country.getAllCountries());
}, []);

const handleCountryChange = (e) => {
  const countryCode = e.target.value;

  setFormData({
    ...formData,
    country: countryCode,
    state: "",
    district: "",
  });

  setStates(State.getStatesOfCountry(countryCode));
  setDistricts([]);
};
const handleStateChange = (e) => {
  const stateCode = e.target.value;

  setFormData({
    ...formData,
    state: stateCode,
    district: "",
  });

  setDistricts(
    City.getCitiesOfState(formData.country, stateCode)
  );
};
const handleDistrictChange = (e) => {
  setFormData({
    ...formData,
    district: e.target.value,
  });
};

  // 🔥 Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };
    fetchCategories();
  }, []);

  // 🔥 Handle normal input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 Handle main category change
  const handleMainCategoryChange = (e) => {
    const selected = categories.find(c => c._id === e.target.value);

    setFormData({
      ...formData,
      reviewerCategory: {
        mainCategory: e.target.value,
        subCategory: ""
      }
    });

    setSubCategories(selected?.subCategories || []);
  };

  // 🔥 Handle sub category change
  const handleSubCategoryChange = (e) => {
    setFormData({
      ...formData,
      reviewerCategory: {
        ...formData.reviewerCategory,
        subCategory: e.target.value
      }
    });
  };

  // 🔥 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/auth/register", formData);
       
      
      navigate("/login");
    } catch (error) {
      console.error("Registration error", error.response?.data || error.message);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
    <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-4">

      {/* Header */}
      <div className="text-center mb-8">
        <img src={logo} alt="logo" className="mx-auto w-35 " />
        <h2 className="text-2xl font-bold text-blue-600">Create Account</h2>
        <p className="text-gray-500 text-sm">
          Secure your research journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">

        {/* 🔥 Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-700 font-semibold">Personal Information</h3>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="affiliation"
              placeholder="Affiliation (University / Organization)"
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.affiliation}
              onChange={handleChange}
            />

            <input
              type="text"
              name="contactNumber"
              placeholder="Contact Number"
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-4">
            <h3 className="text-gray-700 font-semibold">Location & Role</h3>

          {/* Country Dropdown */}
<select
  name="country"
  value={formData.country}
  onChange={handleCountryChange}
  className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  required
>
  <option value="">Select Country</option>
  {countries.map((country) => (
    <option key={country.isoCode} value={country.isoCode}>
      {country.name}
    </option>
  ))}
</select>

{/* State Dropdown */}
<select
  name="state"
  value={formData.state}
  onChange={handleStateChange}
  className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  required
  disabled={!formData.country}
>
  <option value="">Select State</option>
  {states.map((state) => (
    <option key={state.isoCode} value={state.isoCode}>
      {state.name}
    </option>
  ))}
</select>

{/* District Dropdown */}
<select
  name="district"
  value={formData.district}
  onChange={handleDistrictChange}
  className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  required
  disabled={!formData.state}
>
  <option value="">Select District</option>
  {districts.map((city) => (
    <option key={city.name} value={city.name}>
      {city.name}
    </option>
  ))}
</select>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">Author</option>
              <option value="reviewer">Reviewer</option>
            </select>

            {/* Reviewer Only Fields */}
            {formData.role === "reviewer" && (
              <>
                <select
                  value={formData.reviewerCategory.mainCategory}
                  onChange={handleMainCategoryChange}
                  className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.reviewerCategory.subCategory}
                  onChange={handleSubCategoryChange}
                  className="p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sub, index) => (
                    <option key={index} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-500 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>

      </form>
    </div>
  </div>
);
};

export default Register;
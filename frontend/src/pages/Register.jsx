import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock } from "lucide-react"; // Lucide icons
import React from "react";
import logo from '../assets/logo.png'

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);

      if (!response.data.token) {
        console.error("Token is missing in the response");
        return;
      }

      login(response.data.token);
      navigate("/user-dashboard");
    } catch (error) {
      console.error("Registration error", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 gap-1">
    
        <div className='w-full md:w-full h-full flex md:gap-50 gap-5 flex-col md:flex-row items-center justify-center'>
    
          <div className='h-full w-full md:w-1/3 lg:w-1/3 flex flex-col items-center justify-center'>
              <div className='w-full md:max-w-lg flex flex-col items-center justify-center gap-5'>
               
                <p className='text-4xl sm:text-5xl md:text-6xl font-black text-center text-blue-700 pt-20'>
                  <img src={logo} alt="" />
                </p>
                
              </div>
               <div className="pl-30">
                <span className='flex gap-1  py-1 px-3 border rounded-full text-sm text-gray-400'>
                  Secure your reasearch !
                </span>
               </div>
             <div className="pt-15">
               <div className="floating-sk "></div>
             </div>
            </div>
    
          {/* RIGHT SIDE — Login */}
          <div className="w-full md:w-1/3 flex flex-col justify-center items-center">
    
            
    
              
    
      <form onSubmit={handleSubmit} className="bg-white  flex flex-col w-full rounded-xl gap-2 p-4 px-5 shadow-lg">
        <div className='text-center'>
                  <p className='text-blue-600 text-3xl font-bold'>Register !</p>
                   <p className='text-gray-500'>Keep all your credentials safe.</p> 
                </div>
          <div className="flex w-full flex-col p-2 ">
            Name
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full outline-none h-10 rounded-sm p-1 bg-[#f3f4f6]"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
            

          <div className="flex w-full flex-col p-2 ">
            <p>Email</p>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full outline-none h-10 rounded-sm p-1 bg-[#f3f4f6]"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex w-full flex-col p-2 ">
            <p>Password</p>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full outline-none h-10 rounded-sm p-1 bg-[#f3f4f6]"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
           <div className="flex w-full flex-col p-2 ">
            <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="user">Auther</option>
            <option value="reviewer">Reviewer</option>
            
          </select>
            
          </div>
          <div className="flex w-full flex-col p-2 ">
            <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-500 transition duration-300"
          >
            Register
          </button>

            
          </div>

          

          

            <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 hover:underline font-medium">
            Login here
          </Link>
        </p>
        </form>

       
    
            
          </div>
    
        </div>
      </div>
  );
};

export default Register;


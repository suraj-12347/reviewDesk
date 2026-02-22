import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import axios from "../utils/axiosInstance";
import logo from "../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

try {
  const response = await axios.post("/auth/login", formData);

  const { token } = response.data;

  if (!token) {
    console.error("No token received");
    return;
  }

  const decoded = jwtDecode(token);

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(decoded));

  login(token);

  if (decoded.role === "admin") {
    navigate("/admin-dashboard");
  } else if (decoded.role === "reviewer") {
    navigate("/reviewer-dashboard");
  } else {
    navigate("/user-dashboard");
  }

} catch (error) {
  console.error(
    "Login error:",
    error.response?.data?.error || error.message
  );
  setError(error.response?.data?.error || error.message);
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

        

          

          <form onSubmit={handleSubmit} className='bg-white  flex flex-col w-full rounded-xl gap-5 p-4 px-5 shadow-lg'>
            <div className='text-center'>
              <p className='text-blue-600 text-3xl font-bold'>Welcome back !</p>
               <p className='text-gray-500'>Keep all your credentials safe.</p> 
            </div>
           
           
            <div className='flex w-full flex-col p-2 gap-y-2'>
               <p className="text-grey-700">
                Email
              </p>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full outline-none h-10 rounded-sm p-2 bg-[#f3f4f6]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='w-full flex flex-col p-2 gap-y-2'>
              <p className="text-grey-700">
                Password
              </p>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full outline-none h-10 rounded-sm p-2 bg-[#f3f4f6]"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && (
  <p className="text-red-500 text-sm px-2">{error}</p>
)}

            <div className='flex w-full flex-col p-2 gap-y-2'>
              <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-sm hover:bg-blue-700 transition "
            >
              Login
            </button>

            </div>

      

            
          <p className="mt-4 text-center text-sm text-gray-600">
            Do not have an account?{" "}
            <Link
              to="/register"
              className="text-blue-700 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>

          </form>


        
      </div>

    </div>
  </div>
  );
};

export default Login;
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Handle login for email/password
  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.warn("Please fill all the fields!");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/user/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Ensure session cookie is sent with request
        }
      );
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("Login Successful!");
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred");
    }
    setLoading(false);
  };

  const guestLogin = () => {
    setEmail("guest@example.com");
    setPassword("123456");
  };

  useEffect(() => {
    const fetchGoogleUserData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token");
  
      if (token) {
        try {
          // Fetch user data from your backend using the token
          const { data } = await axios.get("http://localhost:3000/api/user/googleUser", {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token if required for fetching user details
            },
          });
          console.log(data);
  
          // Store user data in localStorage
          localStorage.setItem("userInfo", JSON.stringify(data));
  
          toast.success("Google Login Successful!");
          navigate("/chats");
        } catch (error) {
          toast.error("Failed to fetch user data from Google login");
        }
      }
    };
  
    fetchGoogleUserData();
  }, [navigate]);  

  // Initiate Google Login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Log In</h1>

      <div className="w-full max-w-lg">
        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
            <span
              className="absolute top-2.5 right-3 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={submitHandler}
          disabled={loading}
          className={`w-full bg-blue-500 text-white py-2 rounded-md font-medium transition ${
            loading ? "opacity-50" : "hover:bg-blue-600"
          }`}
        >
          {loading ? "Loading..." : "Log In"}
        </button>

        {/* Guest Login */}
        <button
          onClick={guestLogin}
          className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300 transition"
        >
          Use Guest Credentials
        </button>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-3 bg-red-500 text-white py-2 rounded-md font-medium hover:bg-red-600 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;

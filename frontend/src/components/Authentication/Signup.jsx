import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast.warn("Please fill all the fields!");
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast.warn("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/user",
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Registered successfully");
      toast.success("Signup Successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchGoogleUserData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token");

      if (token) {
        try {
          const { data } = await axios.get("http://localhost:3000/api/user/googleUser", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log(data);

          localStorage.setItem("userInfo", JSON.stringify(data));
          toast.success("Google Signup Successful!");
          navigate("/chats");
        } catch (error) {
          toast.error("Failed to fetch user data from Google signup");
        }
      }
    };

    fetchGoogleUserData();
  }, [navigate]);

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Sign Up</h1>

      <div className="w-full max-w-lg">
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your name"
          />
        </div>

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your password"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm your password"
          />
        </div>

        {/* Signup Button */}
        <button
          onClick={submitHandler}
          disabled={loading}
          className={`w-full bg-blue-500 text-white py-2 rounded-md font-medium transition ${
            loading ? "opacity-50" : "hover:bg-blue-600"
          }`}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full mt-3 bg-red-500 text-white py-2 rounded-md font-medium hover:bg-red-600 transition"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default Signup;

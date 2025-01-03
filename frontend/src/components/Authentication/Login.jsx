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

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast.warn("Please fill all the fields!");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/user/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
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

  useEffect(() => {
    const fetchGoogleUserData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token");

      if (token) {
        try {
          const { data } = await axios.get("http://localhost:8080/api/user/googleUser", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Email"
          />
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Password"
          />
          <span
            className="absolute top-2 right-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </div>
        <button
          onClick={submitHandler}
          disabled={loading}
          className={`w-full bg-black text-white py-2 rounded-md transition ${
            loading ? "opacity-50" : "hover:bg-gray-800"
          }`}
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <div className="flex justify-around mt-4">
          <button
            onClick={handleGoogleLogin}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 w-full"
          >
            Log in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
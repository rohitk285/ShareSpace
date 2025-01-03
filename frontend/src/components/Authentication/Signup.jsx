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
        "http://localhost:8080/api/user",
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Signup Successful!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred");
    }
    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  return (
    <div className="flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Name"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Email"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Password"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            placeholder="Confirm Password"
          />
        </div>
        <button
          onClick={submitHandler}
          disabled={loading}
          className={`w-full bg-black text-white py-2 rounded-md transition ${
            loading ? "opacity-50" : "hover:bg-gray-800"
          }`}
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>
        <div className="flex justify-around mt-4">
          <button
            onClick={handleGoogleSignup}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 w-full"
          >
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
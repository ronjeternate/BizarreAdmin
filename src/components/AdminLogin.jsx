import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import LoginBg from "../assets/loginbg.png";
import { db } from "./firebase"; // Import Firestore database
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Define error state
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      const docRef = doc(db, "admin", "admin#1"); // Ensure this document exists in Firestore
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const adminData = docSnap.data();
        if (username === adminData.username && password === adminData.password) {
          localStorage.setItem("isAdmin", "true");
          navigate("/dashboard"); // Ensure "/dashboard" exists in your routes
        } else {
          setError("Invalid username or password.");
        }
      } else {
        setError("Admin credentials not found.");
      }
    } catch (err) {
      setError("Error fetching credentials.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-950/70">
      <div className="bg-white shadow-lg w-[1000px] h-[600px] flex relative">
        <div className="w-3/4">
          <img src={LoginBg} alt="Login" className="w-full h-full object-cover" />
        </div>

        <div className="w-1/2 p-8 flex flex-col justify-center">
          <button className="absolute top-4 right-4 text-blue-950 hover:text-gray-800">
          </button>

          <h2 className="text-lg font-semibold text-center">Log in to</h2>
          <h1 className="text-lg  mb-3">Bizarre Admin</h1>
          <p className="text-lg text-gray-600 text-center mb-6">
          Welcome back admin, please log in your credentials to continue.
          </p>

          {error && <p className="text-red-500 text-center mb-3">{error}</p>} {/* Display error messages */}

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-black/50 mb-3"
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-black/50"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center text-blue-950 cursor-pointer hover:text-blue-950/90"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon  className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full text-white p-2 mt-3 bg-blue-950 hover:bg-blue-950/90 transition cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

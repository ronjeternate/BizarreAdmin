import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/titlelogo.png"; // Ensure it's inside `public/`

const Signout = () => {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.removeItem("isAdmin");
      setShowLoader(false);
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  if (showLoader) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {/* Loader Container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer Loader Animation */}
          <div className="absolute w-24 h-24 border-2 border-blue-950 border-t-transparent rounded-full animate-spin"></div>

          {/* Your Logo Inside Loader */}
          <img 
            src={logo} 
            alt="Loading..." 
            className="w-14 h-14 z-10"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default Signout;

import { Outlet, useNavigate } from "react-router-dom";
import Nav from "./Nav"; // Import sidebar component
import { useEffect } from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
    }
  }, [isAdmin, navigate]);

  return (
    <div className="flex">
      <Nav />
      <div className="flex-1  bg-[#171821]">
        <Outlet /> {/* This will render the Dashboard, Orders, etc. */}
      </div>
    </div>
  );
};

export default AdminLayout;

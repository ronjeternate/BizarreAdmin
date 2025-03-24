import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;

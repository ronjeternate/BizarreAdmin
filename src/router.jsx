import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout"; // Import the new layout
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import Order from "./components/Order";
import OrderHistory from "./components/OrderHistory";
import Product from "./components/Product";
import Message from "./components/Message";
import Feedback from "./components/Feedback";
import Profile from "./components/Profile";
import Users from './components/Users';
import Signout from "./components/Signout";

const router = createBrowserRouter([
  { path: "/login", element: <AdminLogin /> },
  { path: "/", element: <AdminLogin /> },
  {
    path: "/",
    element: <ProtectedRoute />, // Protect all admin routes
    children: [
      {
        element: <AdminLayout />, // Use layout with sidebar
        children: [
          { path: "dashboard", element: <Dashboard /> }, // No leading "/"
          { path: "order", element: <Order /> },
          { path: "product", element: <Product /> },
          { path: "message", element: <Message /> },
          { path: "feedback", element: <Feedback /> },
          { path: "users", element: <Users /> },
          { path: "profile", element: <Profile /> },
          { path: "signout", element: <Signout /> },
          {path: "orderhistory", element: <OrderHistory/>},
        ],
      },
    ],
  },
]);


export default router;

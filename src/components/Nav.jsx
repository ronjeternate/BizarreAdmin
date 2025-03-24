import { FaUsersSlash } from "react-icons/fa"; 
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, Star, User, LogOut } from "lucide-react";

const Nav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Order", path: "/order", icon: <ShoppingCart size={20} /> },
    { name: "Product", path: "/product", icon: <Package size={20} /> },
    { name: "Feedbacks", path: "/feedback", icon: <Star size={20} /> },
    { name: "Users", path: "/users", icon: <FaUsersSlash  size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
    { name: "Signout", path: "/signout", icon: <LogOut size={20} /> },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen bg-[#171821] w-64 p-4 flex flex-col border-r border-white/10">
      <ul className="mt-4 space-y-4">
        {navItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nav;

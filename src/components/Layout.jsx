import React from "react";
import Nav from "./Nav"; // Ensure Nav is correctly imported

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <Nav />

      {/* Main Content */}
      <div className="ml-[250px] p-4 w-full min-h-screen ">
        {children}
        </div>

    </div>
  );
};

export default Layout;

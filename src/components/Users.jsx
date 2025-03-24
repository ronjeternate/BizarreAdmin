import { BiLeftArrow } from "react-icons/bi"; 
import { BiRightArrow } from "react-icons/bi"; 
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import Layout from "./Layout";

const USERS_PER_PAGE = 10;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentDate = new Date();
      const inactiveThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      const userData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;
        const lastActive = data.lastActive ? data.lastActive.toDate() : null;
        const isInactive = lastActive ? (currentDate - lastActive) > inactiveThreshold : true;

        return {
          id: doc.id,
          name: data.fullName || "Unknown",
          email: data.email || "No email",
          dateJoined: createdAt
            ? createdAt.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A",
          lastActive: lastActive
            ? lastActive.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A",
          status: isInactive ? "Inactive" : "Active",
        };
      });

      setUsers(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      console.log("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center ml-[250px] justify-center min-h-screen">
        <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 50 50">
          <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
          <circle className="opacity-100 animate-dash" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="80 40" />
        </svg>
      </div>
    );
    
    const fetchProfileImage = async () => {
          try {
            const adminDoc = await getDoc(doc(db, "admin", "admin#1"));
            if (adminDoc.exists()) {
              setProfilePic(adminDoc.data().imageUrl); // Store image URL
            }
          } catch (error) {
            console.error("Error fetching profile image:", error);
          }
        };
    
        fetchProfileImage();
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
    const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-left  text-xl font-semibold ">Users</h2>
          <div className="relative w-10 h-10">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 rounded-full"></div>
            )}
          </div>
        </div>

        <div className="bg-[#1e1f29] p-4 rounded-2xl shadow-md">
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="p-3">Name</th>
                <th className="p-3">Gmail</th>
                <th className="p-3">Date Joined</th>
                <th className="p-3">Last Active</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
            {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">No users found.</td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="bg-[#21222D] transition">
                    <td className="p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">{user.name[0]}</div>
                      {user.name}
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.dateJoined}</td>
                    <td className="p-3">{user.lastActive}</td>
                    <td className="p-3">
                      <span
                        className={`px-7 py-1 rounded text-sm ${
                          user.status === "Active" ? "bg-[#14CA74]/10 text-[#14CA74] border border-[#14CA74]" : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="text-gray-400 hover:text-red-500 cursor-pointer"
                        onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 mx-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <BiLeftArrow />
          </button>
          <span className="text-white mx-2">Page {currentPage} of {totalPages}</span>
          <button
            className="px-4 py-2 mx-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <BiRightArrow />
          </button>
        </div>
          <div className="text-gray-400 text-center py-3">Total Users: {users.length}</div>
        </div>
        
      </div>
    </Layout>
  );
};

export default UserTable;

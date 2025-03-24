import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast, ToastContainer } from "react-toastify";
import { FiCamera } from "react-icons/fi";
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const adminDoc = await getDoc(doc(db, "admin", "admin#1"));
        if (adminDoc.exists()) {
          setAdmin(adminDoc.data());
          setProfilePic(adminDoc.data().imageUrl || "");
        } else {
          toast.error("Admin data not found.");
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load profile.");
      }
    };
    fetchAdmin();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageFormData = new FormData();
    imageFormData.append("file", file);
    imageFormData.append("upload_preset", "bizarre");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dpgkgzhuo/image/upload", {
        method: "POST",
        body: imageFormData,
      });
      const data = await res.json();
      setProfilePic(data.secure_url);
      await updateDoc(doc(db, "admin", "admin#1"), { imageUrl: data.secure_url });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Error uploading image!");
      console.error("Error uploading image:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!admin) return;
    setLoading(true);

    try {
      // Fetch the admin document to check the current password
      const adminDoc = await getDoc(doc(db, "admin", "admin#1"));
      if (!adminDoc.exists()) {
        toast.error("Admin data not found.");
        setLoading(false);
        return;
      }

      const adminData = adminDoc.data();
      
      // Validate current password
      if (currentPassword !== adminData.password) {
        toast.error("Current password is incorrect.");
        setLoading(false);
        return;
      }

      // Check if new passwords match
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        setLoading(false);
        return;
      }

      // Update Firestore with new password
      await updateDoc(doc(db, "admin", "admin#1"), { 
        fullName: admin.fullName, 
        password: newPassword 
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center min-h-screen py-10 px-5">
        <ToastContainer position="top-right" autoClose={1000} />
        <div className="flex gap-5 rounded-lg shadow-md w-full">
          <div className="flex flex-col items-center bg-[#323232]/30 p-6 h-70 w-70 rounded-lg">
            <div className="relative w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-500 rounded-full"></div>
              )}

            </div>
            

            <h2 className="text-white text-lg mt-3">{admin?.fullName}</h2>
            <label className="relative bottom-20 left-12 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full cursor-pointer shadow-lg">
                <FiCamera className="text-lg" />
                <input type="file" className="hidden" onChange={handleImageUpload} />
              </label>
          </div>

          <div className="bg-[#323232]/30 p-6 rounded-lg w-full text-left h-150">
            <h2 className="text-white text-xl font-semibold">My Profile</h2>
            <div className="mt-4">
              <label className="text-gray-400 text-sm">Name</label>
              <input
                type="text"
                value={admin?.fullName || ""}
                onChange={(e) => setAdmin({ ...admin, fullName: e.target.value })}
                className="w-full p-3 bg-[#1e40af]/20 text-white rounded-md mt-1"
              />
            </div>

            <h2 className="text-white text-lg font-semibold mt-17">Change Password</h2>
            <div>
              {/* Current Password */}
              <div className="mt-4 relative">
                <label className="text-gray-400 text-sm">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 bg-[#1e40af]/20 text-white rounded-md mt-1 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mt-4 relative">
                <label className="text-gray-400 text-sm">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-[#1e40af]/20 text-white rounded-md mt-1 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="mt-4 relative">
                <label className="text-gray-400 text-sm">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-[#1e40af]/20 text-white rounded-md mt-1 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

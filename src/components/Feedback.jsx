import { FiEdit3 } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai"; 
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import Layout from "./Layout";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", desc: "", rating: 1, shown: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const feedbacksRef = collection(db, "testimonials");

    // Real-time listener for changes in Firestore
    const unsubscribe = onSnapshot(feedbacksRef, (snapshot) => {
      const feedbackList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbacks(feedbackList);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "testimonials", id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback.id);
    setEditForm({ shown: feedback.shown });
  };

  const handleUpdate = async () => {
    if (!editingFeedback) return;
    setLoading(true);
    try {
      const feedbackRef = doc(db, "testimonials", editingFeedback);
      await updateDoc(feedbackRef, editForm);
      setEditingFeedback(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filter === "visible") return feedback.shown === true;
    if (filter === "hidden") return feedback.shown === false;
    return true;
  });

  return (
    <Layout>
      <div className="p-6 min-h-screen text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Feedbacks</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#21222D] text-white border border-gray-700 rounded px-3 py-1"
          >
            <option value="all">All</option>
            <option value="visible">Visible Feedbacks</option>
            <option value="hidden">Hidden Feedbacks</option>
          </select>
        </div>

        <div className="space-y-4 mt-4">
          {filteredFeedbacks.map(({ id, name, desc, rating, shown }) => (
            <div
              key={id}
              className={`bg-gray-800 p-4 px-10 rounded-lg flex justify-between items-center ${
                !shown ? "border border-red-500/50" : "border border-green-500/50"
              }`}
            >
              <div className="text-left w-full"> {/* Set a width to prevent full stretching */}
                <h3 className="font-semibold">{name}</h3>
                <p className="text-gray-400 break-words max-w-5xl">
                  {desc}
                </p>
                <div className="flex text-yellow-400 mt-2">
                  <AiFillStar className="mr-2 mt-1" />{rating}
                </div>
              </div>
              {/* Keep buttons aligned properly */}
              <div className="flex space-x-3 items-center justify-end w-1/5">
                <button
                  onClick={() => handleEdit({ id, name, desc, rating, shown })}
                  className="text-gray-400 hover:text-green-500 cursor-pointer"
                >
                  <FiEdit3 size={20} />
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
          ))}
        </div>
      </div>

      {editingFeedback && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4">
          <div className="bg-[#1e1f29] border p-5 border-blue-950 rounded-2xl shadow-lg w-110 text-black">
            <h3 className="text-lg font-semibold mb-8 border-b border-white/30 text-white">
              Edit Feedback Status
            </h3>
            <label className="flex items-center space-x-2 mb-8 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.shown}
                onChange={(e) => setEditForm({ ...editForm, shown: e.target.checked })}
              />
              <span>Show Feedback</span>
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingFeedback(null)}
                className="border px-5 bg-blue-950/20 text-blue-500 hover:bg-blue-950/30 cursor-pointer rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-5 py-2 bg-blue-950 hover:bg-blue-950/90 text-white rounded cursor-pointer"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Feedback;

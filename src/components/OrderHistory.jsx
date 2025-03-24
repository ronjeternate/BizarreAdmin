import { IoIosArrowBack } from "react-icons/io";
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Layout from "./Layout";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-[#14CA74]/10 text-[#14CA74] border border-[#14CA74]";
    case "Packed":
    case "Shipped":
      return "bg-blue-500/10 text-blue-500 border border-blue-500";
    case "Pending":
      return "bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]";
    case "Cancelled":
      return "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]";
    default:
      return "bg-gray-600 text-white";
  }
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const cancelledOrdersRef = collection(db, "orders", "cancelled_orders", "list");
        const completedOrdersRef = collection(db, "orders", "completed_orders", "list");

        const cancelledSnapshot = await getDocs(cancelledOrdersRef);
        const completedSnapshot = await getDocs(completedOrdersRef);

        const fetchedOrders = [];

        cancelledSnapshot.forEach(doc => {
          fetchedOrders.push({ id: doc.id, ...doc.data(), status: "Cancelled" });
        });

        completedSnapshot.forEach(doc => {
          fetchedOrders.push({ id: doc.id, ...doc.data(), status: "Completed" });
        });

        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async () =>{   
      closeModal();
  };

  if (loading)
    return (
      <div className="flex items-center ml-[250px] justify-center min-h-screen">
      <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 50 50">
        <circle 
          className="opacity-25" 
          cx="25" cy="25" r="20" 
          stroke="currentColor" 
          strokeWidth="6" 
          fill="none" 
        />
        <circle 
          className="opacity-100 animate-dash"
          cx="25" cy="25" r="20"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="80 40"
        />
      </svg>
    </div>
    );
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between">
          <Link to="/order">
            <button className="text-[20px] text-white cursor-pointer">
              <IoIosArrowBack />
            </button>
          </Link>
          <h2 className="text-white text-xl font-semibold mb-4">Orders History</h2>
          <h2 className="opacity-0">Orders</h2>
        </div>

        <div className="bg-[#1e1f29] p-4 rounded-2xl shadow-md">
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="p-3">Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Gmail</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2A2B38] transition cursor-pointer" onClick={() => handleOrderClick(order)}>
                    <td className="p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center curpo text-white">
                        {order.name[0]}
                      </div>
                      {order.name}
                    </td>
                    <td className="p-3">{order.date}</td>
                    <td className="p-3">{order.email}</td>
                    <td className="p-3">{order.total}</td>
                    <td className="p-3">
                      <span className={`px-5 py-1 rounded-sm text-sm font-semibold ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="text-gray-400 text-center py-3">Total Orders: {orders.length}</div>

          {/* Order Details Modal */}
          <AnimatePresence>
            {selectedOrder && (
                      <AnimatePresence>
                        <motion.div 
                          className="fixed inset-0 flex justify-center items-center backdrop-blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div 
                            className="bg-[#1e1f29] p-6 rounded-2xl shadow-xl w-[500px] border border-blue-950 relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                          >
                            <button 
                              className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
                              onClick={closeModal}
                            >
                              <X size={22} />
                            </button>
                            
                            <h2 className="text-xl font-semibold text-white text-center mb-5">Order Details</h2>
                            
                            <div className="text-gray-300 space-y-3 text-left">
                            <p><strong className="text-gray-200">Order's id:</strong> {selectedOrder.id}</p>
                            <p><strong className="text-gray-200">Order's Name:</strong> {selectedOrder.ordername}</p>
                            <p><strong className="text-gray-200">Address:</strong> {selectedOrder.orderaddress}</p>
                            <p><strong className="text-gray-200">Phone #:</strong> {selectedOrder.orderphone}</p>
                            <p><strong className="text-gray-200">Email:</strong> {selectedOrder.email}</p>
                            <p><strong className="text-gray-200">Date:</strong> {selectedOrder.date}</p>
                            <p><strong className="text-gray-200">Total:</strong> {selectedOrder.total}</p>
                              <p>
                                <strong className="text-gray-200">Status:</strong> 
                                <span className={`ml-2 px-3 py-1 rounded-md text-sm font-semibold ${getStatusClass(selectedOrder.status)}`}>
                                  {selectedOrder.status}
                                </span>
                              </p>
            
                              {selectedOrder.products.length > 0 && (
                                <>
                                  <p className="mt-4 text-lg font-semibold text-white">Ordered Products:</p>
                                  <div className="space-y-4">
                                    {selectedOrder.products.map((product, index) => (
                                      <motion.div 
                                        key={index} 
                                        className="flex gap-4 items-center bg-[#292A36] p-4 rounded-lg shadow-md border border-gray-700"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                      >
                                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg border border-gray-600" />
                                        <div className="text-left flex">
                                          <div>
                                            <p className="text-white font-medium">{product.name}</p>
                                            <p className="text-gray-400 text-sm">Size: {product.size} | Qty: {product.quantity}</p>
                                            <p className="text-gray-300 text-sm">
                                              ₱{product.unitPrice} x {product.quantity} = 
                                              <strong className="text-white "> ₱{product.totalPrice}</strong>
                                            </p>
                                          </div>
                                          <p className="text-white ml-15 text-2xl"> ₱{product.totalPrice}</p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </>
                              )}
                              <button 
                                className={`bg-blue-950/30 border border-blue-950 w-full text-white px-4 py-2 mt-4 rounded 
                                  ${isUpdatingStatus ? "cursor-not-allowed opacity-75" : "hover:bg-blue-950 cursor-pointer"}`}
                                onClick={handleStatusChange}
                              >
                                {isUpdatingStatus && (
                                  <svg className="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="15" fill="none" />
                                  </svg>
                                )}
                                {isUpdatingStatus ? "Closing..." : "Close"}
                              </button>
            
            
                              
                            </div>
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default OrderHistory;


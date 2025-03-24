import { BiLeftArrow } from "react-icons/bi"
import { BiRightArrow } from "react-icons/bi"
import { useEffect, useState } from "react"
import { Trash2, X } from "lucide-react"
import { db } from "./firebase"
import { collection, getDoc, doc, updateDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "./Layout"
import { Link } from "react-router-dom"

const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "bg-[#14CA74]/10 text-[#14CA74] border border-[#14CA74]"
    case "Packed":
    case "Shipped":
      return "bg-blue-500/10 text-blue-500 border border-blue-500"
    case "Pending":
      return "bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]"
    case "Cancelled":
      return "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]"
    default:
      return "bg-gray-600 text-white"
  }
}

const OrderTable = ({ isAdmin }) => {
  const auth = getAuth()
  const user = auth.currentUser
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [profilePic, setProfilePic] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10
  const [statusFilter, setStatusFilter] = useState("All")
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const adminRef = doc(db, "admin", "admin#1") // Reference to the admin doc
        const adminDoc = await getDoc(adminRef)
        if (adminDoc.exists()) {
          setProfilePic(adminDoc.data().imageUrl)
        }
      } catch (error) {
        console.error("Error fetching admin profile image:", error)
      }
    }

    fetchProfileImage()
  }, [])

  // Fetch Orders from Users Collection
  useEffect(() => {
    if (!user) {
      setError("You must be logged in to view orders.")
      setLoading(false)
      return
    }

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (usersSnapshot) => {
      let allOrders = []

      const unsubscribes = usersSnapshot.docs.map((userDoc) => {
        const userOrdersRef = collection(userDoc.ref, "orders")

        return onSnapshot(userOrdersRef, (ordersSnapshot) => {
          const userOrders = ordersSnapshot.docs.map((orderDoc) => {
            const orderData = orderDoc.data()

            return {
              id: orderDoc.id,
              userId: userDoc.id,
              name: userDoc.data().fullName || "Unknown",
              ordername: orderData.customerName || "Unknown",
              orderphone: orderData.customerPhone,
              orderaddress: orderData.customerAddress,
              email: userDoc.data().email || "No email",
              date: orderData.orderDate?.toDate().toLocaleDateString("en-US"),
              total: `₱${orderData.total}`,
              status: orderData.status,
              products: orderData.products || [],
            }
          })

          allOrders = [...allOrders.filter((o) => o.userId !== userDoc.id), ...userOrders]
          setOrders(allOrders)
          setLoading(false)
        })
      })

      return () => unsubscribes.forEach((unsub) => unsub())
    })

    return () => unsubscribeUsers()
  }, [user])

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage

  const filteredOrders = statusFilter === "All" ? orders : orders.filter((order) => order.status === statusFilter)

  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Change page
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const updateOrderStatus = async (orderId, email, name, newStatus) => {
    try {
      const response = await fetch("http://localhost:5000/send-order-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          name: name,
          orderId: orderId,
          status: newStatus,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        console.log("Order update email sent:", data.message)
      } else {
        console.error("Failed to send order update email:", data.error)
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const handleOrderClick = async (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)

    // Reset cancel reason when opening a new order
    setCancelReason("")

    // If the order is cancelled, fetch the cancel reason
    if (order.status === "Cancelled") {
      try {
        const orderRef = doc(db, "users", order.userId, "orders", order.id)
        const orderDoc = await getDoc(orderRef)

        if (orderDoc.exists()) {
          // Check for different possible field names
          const reason =
            orderDoc.data().cancelReason ||
            orderDoc.data().cancellationReason ||
            orderDoc.data().reason ||
            orderDoc.data().cancel_reason

          if (reason) {
            setCancelReason(reason)
          } else {
            console.log("Cancel reason fields not found. Available fields:", Object.keys(orderDoc.data()))
            setCancelReason("Cancelled by seller")
          }
        } else {
          setCancelReason("Cancelled by seller")
        }
      } catch (error) {
        console.error("Error fetching cancel reason:", error)
        setCancelReason("Error fetching reason")
      }
    }
  }

  const closeModal = () => {
    setSelectedOrder(null)
  }

  const handleStatusChange = async () => {
    if (!selectedOrder) return
    setIsUpdatingStatus(true)

    try {
      const orderRef = doc(db, "users", selectedOrder.userId, "orders", selectedOrder.id)
      await updateDoc(orderRef, { status: newStatus })

      // Send email notification for order status update
      await updateOrderStatus(selectedOrder.id, selectedOrder.email, selectedOrder.ordername, newStatus)

      // Update UI
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === selectedOrder.id ? { ...order, status: newStatus } : order)),
      )

      closeModal()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center ml-[250px] justify-center min-h-screen">
        <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 50 50">
          <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
          <circle
            className="opacity-100 animate-dash"
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="80 40"
          />
        </svg>
      </div>
    )

  if (error) return <p className="text-center text-red-500">{error}</p>

  const handleDeleteOrder = async (order, e) => {
    e.stopPropagation() // Prevent row click event from triggering

    if (!["Cancelled", "Completed"].includes(order.status)) return

    const targetCollection = order.status === "Cancelled" ? "cancelled_orders" : "completed_orders"

    try {
      // Reference to the target subcollection
      const targetRef = collection(db, "orders", targetCollection, "list")

      // Add the order as a new document inside the respective subcollection
      await addDoc(targetRef, order)

      // Delete the order from the original user orders collection
      const orderRef = doc(db, "users", order.userId, "orders", order.id)
      await deleteDoc(orderRef)

      // Update UI
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id))

      console.log(`Order moved to ${targetCollection} successfully.`)
    } catch (error) {
      console.error("Error moving order:", error)
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between"></div>
        <div className="flex justify-between mt-3 items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Orders</h2>
          <div className="flex items-center ">
            <label htmlFor="statusFilter" className="text-white mr-2">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              className="bg-[#21222D] text-white border border-gray-700 rounded px-3 py-1"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
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
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`cursor-pointer ${index % 2 === 0 ? "bg-[#21222D]" : "bg-blue-950/50"} hover:bg-[#2A2B38] transition`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
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
                    <td className="p-3">
                      {["Completed", "Cancelled"].includes(order.status) && (
                        <button
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteOrder(order, e)
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              <BiLeftArrow />
            </button>
            <span className="text-white">{`Page ${currentPage} of ${Math.ceil(filteredOrders.length / ordersPerPage)}`}</span>
            <button
              onClick={nextPage}
              disabled={currentPage >= Math.ceil(filteredOrders.length / ordersPerPage)}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 "
            >
              <BiRightArrow />
            </button>
          </div>

          <div className="text-gray-400 text-center py-3">
            Total Orders: {filteredOrders.length} {statusFilter !== "All" && `(Filtered from ${orders.length})`}
          </div>
        </div>
        <Link to="/orderhistory" className="text-[15px] absolute right-20 mt-4 mb-2 text-blue-600 cursor-pointer">
          View Orders History
        </Link>

        {/* Order Details Modal */}
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
                  <p>
                    <strong className="text-gray-200">Order's id:</strong> {selectedOrder.id}
                  </p>
                  <p>
                    <strong className="text-gray-200">Order's Name:</strong> {selectedOrder.ordername}
                  </p>
                  <p>
                    <strong className="text-gray-200">Address:</strong> {selectedOrder.orderaddress}
                  </p>
                  <p>
                    <strong className="text-gray-200">Phone #:</strong> {selectedOrder.orderphone}
                  </p>
                  <p>
                    <strong className="text-gray-200">Email:</strong> {selectedOrder.email}
                  </p>
                  <p>
                    <strong className="text-gray-200">Date:</strong> {selectedOrder.date}
                  </p>
                  <p>
                    <strong className="text-gray-200">Total:</strong> {selectedOrder.total}
                  </p>
                  <p>
                    <strong className="text-gray-200">Status:</strong>
                    <span
                      className={`ml-2 px-3 py-1 rounded-md text-sm font-semibold ${getStatusClass(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>

                    {selectedOrder.status !== "Cancelled" ? (
                      <select
                        className="ml-2 bg-gray-700 text-white"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        {["Pending", "Packed", "Shipped", "Completed", "Cancelled"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-5 p-2 px-4 bg-[#FF3B30]/10 border border-[#FF3B30] rounded-md">
                        <strong className="text-gray-200">Cancel Reason:</strong> {cancelReason}
                      </div>
                    )}
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
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg border border-gray-600"
                            />
                            <div className="text-left flex">
                              <div>
                                <p className="text-white font-medium">{product.name}</p>
                                <p className="text-gray-400 text-sm">
                                  Size: {product.size} | Qty: {product.quantity}
                                </p>
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
                  {selectedOrder.status !== "Cancelled" && (
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
                      {isUpdatingStatus ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        
      </div>
    </Layout>
  )
}

export default OrderTable


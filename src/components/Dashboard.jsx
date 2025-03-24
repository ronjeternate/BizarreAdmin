import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Layout from "./Layout";
import { db } from "./firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";

const data = [
  { name: "Active Users", value: 1200, color: "#2d61f2" },
  { name: "Inactive Users", value: 674, color: "#1e293b" },
];

const revenueData = [
  { month: "Jan", revenue: 10000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 12000 },
  { month: "Apr", revenue: 25000 },
  { month: "May", revenue: 48000 },
  { month: "Jun", revenue: 30000 },
  { month: "Jul", revenue: 42000 },
  { month: "Aug", revenue: 35000 },
  { month: "Sep", revenue: 38000 },
  { month: "Oct", revenue: 40000 },
  { month: "Nov", revenue: 45000 },
  { month: "Dec", revenue: 50000 },
];

const topProducts = [
  { id: "01", name: "Dior Sauvage", popularity: 46, sales: "46%" },
  { id: "02", name: "C H Good Girl", popularity: 17, sales: "17%" },
  { id: "03", name: "Polo Sport", popularity: 19, sales: "19%" },
  { id: "04", name: "Miss Dior", popularity: 29, sales: "29%" },
];

const Dashboard = () => {
  const [orders1, setOrders1] = useState([]);
  const [orders2, setOrders2] = useState([]);
  const [profilePic, setProfilePic] = useState(""); // Admin profile picture

  useEffect(() => {
    // Fetch Admin Profile Picture
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

    // Fetch orders from users -> orders
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (usersSnapshot) => {
      let allOrders1 = [];

      const unsubscribes1 = usersSnapshot.docs.map((userDoc) => {
        const userOrdersRef = collection(userDoc.ref, "orders");

        return onSnapshot(userOrdersRef, (ordersSnapshot) => {
          const userOrders = ordersSnapshot.docs.map((orderDoc) => ({
            id: orderDoc.id,
            userId: userDoc.id,
            ...orderDoc.data(),
          }));

          allOrders1 = [...allOrders1.filter((o) => o.userId !== userDoc.id), ...userOrders];
          setOrders1(allOrders1);
        });
      });

      return () => unsubscribes1.forEach((unsub) => unsub());
    });

    // Fetch orders from orders -> cancelled_orders & completed_orders -> list
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (ordersSnapshot) => {
      ordersSnapshot.docs.forEach((orderDoc) => {
        const cancelledOrdersRef = collection(orderDoc.ref, "cancelled_orders");
        const completedOrdersRef = collection(orderDoc.ref, "completed_orders");

        // Fetch cancelled orders
        const unsubCancelled = onSnapshot(cancelledOrdersRef, (cancelledSnapshot) => {
          const cancelledOrders = cancelledSnapshot.docs.map((cancelledDoc) => ({
            id: cancelledDoc.id,
            status: "Cancelled",
            ...cancelledDoc.data(),
          }));

          setOrders2((prev) => [...prev, ...cancelledOrders]); // Append to existing state
        });

        // Fetch completed orders -> list
        const unsubCompleted = onSnapshot(completedOrdersRef, (completedSnapshot) => {
          completedSnapshot.docs.forEach((completedDoc) => {
            const completedListRef = collection(completedDoc.ref, "list");

            const unsubList = onSnapshot(completedListRef, (listSnapshot) => {
              const completedOrders = listSnapshot.docs.map((listDoc) => ({
                id: listDoc.id,
                status: "Completed",
                ...listDoc.data(),
              }));

              setOrders2((prev) => [...prev, ...completedOrders]); // Append to existing state
            });

            return () => unsubList();
          });
        });

        return () => {
          unsubCancelled();
          unsubCompleted();
        };
      });
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
    };
  }, []);

  const totalOrders = orders1.length + orders2.length;

  return (
    <Layout>
      <div className="p-6 text-white min-h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold">Welcome back, Admin!</h1>
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

        {/* Analytics Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#21222D] p-4 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold">₱5k Total Sales</p>
          </div>
          <div className="bg-[#21222D] p-4 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold">{totalOrders} Total Orders</p>
          </div>
          <div className="bg-[#21222D] p-4 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold">9 Product Sold</p>
          </div>
          <div className="bg-[#21222D] p-4 rounded-lg shadow-md text-center">
            <p className="text-lg font-semibold">12 New Customers</p>
          </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Top Products Section */}
        <div className="bg-[#21222D] p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-xl text-left font-bold mb-2">Top Products</h2>
          <table className="w-full">
            <thead>
              <tr className="text-gray-400">
                <th className="py-3">#</th>
                <th>Name</th>
                <th>Popularity</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-700">
                  <td className="py-2 text-gray-400">{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <div className="w-full bg-gray-700 rounded-md h-2">
                      <div className="bg-blue-500 h-2 rounded-md" style={{ width: `${product.popularity}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <span className="bg-gray-800 text-blue-400 px-2 py-1 rounded-lg text-sm">{product.sales}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Statistics (Pie Chart) */}
        <div className="bg-[#21222D] p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">Overall Users</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey="value" outerRadius={80}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around text-gray-400 text-sm">
            {data.map((entry, index) => (
              <p key={index} className="flex items-center">
                <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ background: entry.color }}></span>
                {entry.name}
              </p>
            ))}
          </div>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-[#21222D] p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-bold mb-2">Revenue</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueData}>
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <Line type="monotone" dataKey="revenue" stroke="#2d61f2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    </Layout>
  );
};

export default Dashboard;
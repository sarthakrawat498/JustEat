import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserOrders } from "../api/orderApi";

const statusCls = (status) => {
  const base =
    "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  const map = {
    PENDING: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400`,
    PREPARING: `${base} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400`,
    READY: `${base} bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400`,
    COMPLETED: `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`,
  };
  return map[status] || base;
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none p-0 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
          My Orders
        </h1>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your order history will appear here after your first order.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all cursor-pointer border-none"
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-base">
                      {order.restaurantName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Order #{order.orderId}
                    </p>
                  </div>
                  <span className={statusCls(order.status)}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-1.5 mb-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span>
                        {item.name}
                        <span className="text-gray-400 dark:text-gray-500 ml-1">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-extrabold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-orange-500">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOwnerOrders, updateOrderStatus } from "../api/orderApi";

const NEXT_STATUS = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

const NEXT_LABEL = {
  PENDING: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Complete Order",
};

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

// Simple self-dismissing toast
const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          t.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {t.message}
      </div>
    ))}
  </div>
);

const OwnerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  }, []);

  useEffect(() => {
    getOwnerOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, status: newStatus } : o,
        ),
      );
      addToast(`Order #${orderId} → ${newStatus}`, "success");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to update order status.";
      addToast(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <Toast toasts={toasts} />
      <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-4 cursor-pointer bg-transparent border-none p-0 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
          Incoming Orders
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
            <div className="text-7xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              No orders yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Orders will appear here once customers start placing them.
            </p>
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
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
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
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mb-4 flex justify-between font-extrabold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-orange-500">
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>

                {/* Linear next-step button */}
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() =>
                      handleStatusChange(
                        order.orderId,
                        NEXT_STATUS[order.status],
                      )
                    }
                    disabled={updatingId === order.orderId}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white transition-all cursor-pointer border-none"
                  >
                    {updatingId === order.orderId && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {NEXT_LABEL[order.status]} →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerOrders;

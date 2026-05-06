import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserOrders, repeatOrder, rateOrder } from "../api/orderApi";
import { useCart } from "../context/CartContext";

/* ---------- Helpers ---------- */
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

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ---------- Star Rating ---------- */
const StarRating = ({ orderId, onRated }) => {
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRate = async (star) => {
    setSelected(star);
    setSubmitting(true);
    setError("");
    try {
      await rateOrder(orderId, star);
      onRated(orderId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating.");
      setSelected(0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-semibold">
        Rate this order
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={submitting}
            onClick={() => handleRate(star)}
            className="text-2xl leading-none bg-transparent border-none cursor-pointer p-0 disabled:opacity-50"
          >
            {star <= selected ? "⭐" : "☆"}
          </button>
        ))}
        {submitting && (
          <span className="ml-2 text-xs text-gray-400">Submitting…</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

/* ---------- Repeat Result Modal ---------- */
const RepeatModal = ({ result, onClose, onGoToCart }) => {
  const {
    addedItems = [],
    priceChangedItems = [],
    unavailableItems = [],
  } = result;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">
          Order Added to Cart
        </h2>

        {addedItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1.5">
              ✓ Added ({addedItems.length})
            </p>
            <div className="flex flex-col gap-1">
              {addedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ₹{Number(item.oldPrice).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {priceChangedItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1.5">
              ⚠ Price Changed ({priceChangedItems.length})
            </p>
            <div className="flex flex-col gap-1">
              {priceChangedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    <span className="line-through text-gray-400 mr-1">
                      ₹{Number(item.oldPrice).toFixed(2)}
                    </span>
                    <span className="text-orange-500">
                      ₹{Number(item.newPrice).toFixed(2)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {unavailableItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1.5">
              ✗ Unavailable ({unavailableItems.length})
            </p>
            <div className="flex flex-col gap-1">
              {unavailableItems.map((item, i) => (
                <div
                  key={i}
                  className="text-sm text-gray-400 dark:text-gray-500 line-through"
                >
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onGoToCart}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer border-none"
          >
            Go to Cart
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer border-none"
          >
            Stay Here
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
const OrderHistory = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repeating, setRepeating] = useState(null);
  const [repeatResult, setRepeatResult] = useState(null);

  useEffect(() => {
    getUserOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const handleRepeat = useCallback(
    async (orderId) => {
      setRepeating(orderId);
      try {
        const res = await repeatOrder(orderId);
        await fetchCart();
        setRepeatResult(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Could not repeat order.");
      } finally {
        setRepeating(null);
      }
    },
    [fetchCart],
  );

  // Mark order as rated in local state so star UI disappears immediately
  const handleRated = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, ratingGiven: true } : o,
      ),
    );
  }, []);

  return (
    <>
      <Navbar />
      {repeatResult && (
        <RepeatModal
          result={repeatResult}
          onClose={() => setRepeatResult(null)}
          onGoToCart={() => {
            setRepeatResult(null);
            navigate("/cart");
          }}
        />
      )}
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
                <div className="flex items-start justify-between gap-3 mb-1">
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

                {/* Date */}
                {order.createdAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    🕐 {formatDate(order.createdAt)}
                  </p>
                )}

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

                {/* Footer: total + repeat */}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between gap-3">
                  <div className="font-extrabold text-gray-900 dark:text-white flex gap-2">
                    <span>Total</span>
                    <span className="text-orange-500">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRepeat(order.orderId)}
                    disabled={repeating === order.orderId}
                    className="text-sm font-bold px-4 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {repeating === order.orderId
                      ? "Adding…"
                      : "🔁 Repeat Order"}
                  </button>
                </div>

                {/* Rating — only for COMPLETED and not yet rated */}
                {order.status === "COMPLETED" && !order.ratingGiven && (
                  <StarRating orderId={order.orderId} onRated={handleRated} />
                )}

                {/* Already rated badge */}
                {order.status === "COMPLETED" && order.ratingGiven && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      ⭐ You rated this order
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistory;

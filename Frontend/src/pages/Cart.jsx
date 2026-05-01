import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { checkout as checkoutApi } from "../api/orderApi";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartLoading,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (menuItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      await updateCartItem(menuItemId, newQty);
    } catch {
      // silently fail; UI will re-sync from server
    }
  };

  const handleRemove = async (menuItemId) => {
    try {
      await removeCartItem(menuItemId);
    } catch {
      // ignore
    }
  };

  const handleCheckout = async () => {
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      await checkoutApi();
      clearCart();
      setCheckoutSuccess(true);
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message || "Checkout failed. Please try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

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
          Your Cart
        </h1>

        {checkoutSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-5 py-8 text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-1">
              Order Placed!
            </h2>
            <p className="text-sm text-green-600 dark:text-green-500 mb-4">
              Your order has been successfully placed. Enjoy your meal!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all cursor-pointer border-none text-sm"
            >
              Back to Home
            </button>
          </div>
        )}

        {!checkoutSuccess && (
          <>
            {cartLoading && (
              <div className="flex justify-center items-center py-16">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            )}

            {!cartLoading &&
              (!cart || !cart.items || cart.items.length === 0) && (
                <div className="text-center py-20">
                  <div className="text-7xl mb-4">🛒</div>
                  <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Your cart is empty
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Add items from a restaurant to get started.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-all cursor-pointer border-none"
                  >
                    Browse Restaurants
                  </button>
                </div>
              )}

            {!cartLoading && cart && cart.items && cart.items.length > 0 && (
              <div className="flex flex-col gap-6">
                {/* Restaurant info */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-orange-500 text-lg">🏪</span>
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    {cart.restaurantName}
                  </span>
                </div>

                {/* Cart items */}
                <div className="flex flex-col gap-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 shadow-sm"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-orange-50 dark:bg-orange-900/20">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🍴
                          </div>
                        )}
                      </div>

                      {/* Name + unit price */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-orange-500 font-bold text-sm">
                          ₹{(item.price / item.quantity).toFixed(2)}
                          <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">
                            / unit
                          </span>
                        </p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.menuItemId,
                              item.quantity,
                              -1,
                            )
                          }
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-500 font-bold text-lg flex items-center justify-center cursor-pointer border-none transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 dark:text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.menuItemId,
                              item.quantity,
                              1,
                            )
                          }
                          disabled={item.quantity >= 99}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-500 font-bold text-lg flex items-center justify-center cursor-pointer border-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right min-w-[56px]">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.menuItemId)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-1 ml-1"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Order summary */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                    Order Summary
                  </h2>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>
                      Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>₹{Number(cart.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between font-extrabold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span className="text-orange-500 text-lg">
                      ₹{Number(cart.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  {checkoutError && (
                    <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 text-sm">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-all cursor-pointer border-none text-base flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Placing Order…
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Cart;

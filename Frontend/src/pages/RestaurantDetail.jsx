import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurant } from "../api/restaurantApi";
import { getMenu } from "../api/menuApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const dietCls = (d) => {
  const base = "text-xs font-bold px-2.5 py-0.5 rounded-full border";
  const map = {
    VEG: `${base} bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400  border-green-300  dark:border-green-700`,
    NON_VEG: `${base} bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400    border-red-300    dark:border-red-700`,
    EGG: `${base} bg-yellow-100 dark:bg-yellow-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700`,
    VEGAN: `${base} bg-teal-100   dark:bg-teal-900/30   text-teal-700   dark:text-teal-400   border-teal-300   dark:border-teal-700`,
    JAIN: `${base} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700`,
    GLUTEN_FREE: `${base} bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700`,
  };
  return map[d] || base;
};

const tagCls =
  "text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 capitalize";

const RestaurantDetail = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, cart } = useCart();
  const { role } = useAuth();
  const [addingItemId, setAddingItemId] = useState(null);
  const [addedItemId, setAddedItemId] = useState(null);

  // Helper: get quantity of item currently in cart
  const getCartQty = (menuItemId) =>
    cart?.items?.find((i) => i.menuItemId === menuItemId)?.quantity ?? 0;

  const handleAddToCart = async (item) => {
    if (role !== "CUSTOMER") return;
    setAddingItemId(item.id);
    try {
      await addToCart(item.id, 1);
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 1500);
    } catch (err) {
      // cross-restaurant cart conflict
      const msg = err?.response?.data?.message || "";
      if (msg) alert(msg);
    } finally {
      setAddingItemId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getRestaurant(publicId), getMenu(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
      })
      .catch(() => setError("Failed to load restaurant details."))
      .finally(() => setLoading(false));
  }, [publicId]);

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <button
          className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-orange-500 text-sm font-semibold mb-6 cursor-pointer bg-transparent border-none p-0 transition-colors"
          onClick={() => navigate("/")}
        >
          ← Back to restaurants
        </button>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && restaurant && (
          <>
            <div className="relative w-full h-72 rounded-xl overflow-hidden mb-8">
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-8xl">
                  🍴
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-end p-6 text-white">
                <div>
                  <div className="text-4xl font-extrabold">
                    {restaurant.name}
                  </div>
                  <div className="text-sm opacity-85 mt-1">
                    {restaurant.description}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center mb-8">
              <span className={tagCls}>📍 {restaurant.location}</span>
              {(restaurant.cuisineTypes || []).map((c) => (
                <span key={c} className={tagCls}>
                  {c.replace("_", " ")}
                </span>
              ))}
              {restaurant.restaurantStatus && (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                    restaurant.restaurantStatus === "OPEN"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {restaurant.restaurantStatus}
                </span>
              )}
              {restaurant.rating != null && (
                <span className="flex items-center gap-1 text-sm font-bold text-orange-700 dark:text-orange-400">
                  ★ {restaurant.rating.toFixed(1)} ({restaurant.ratingCount})
                </span>
              )}
            </div>

            {/* Today's Special */}
            {menu.filter((item) => item.isSpecial && item.available !== false)
              .length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⭐</span>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                    Today&apos;s Special
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {menu
                    .filter(
                      (item) => item.isSpecial && item.available !== false,
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-56 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl overflow-hidden shadow-md"
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center text-4xl bg-yellow-100 dark:bg-yellow-900/30">
                            🍴
                          </div>
                        )}
                        <div className="p-3">
                          <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                            {item.name}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-extrabold text-orange-500">
                              ₹{Number(item.price).toFixed(2)}
                            </span>
                            {role === "CUSTOMER" && (
                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={addingItemId === item.id}
                                className="text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-3 py-1 rounded-lg border-none cursor-pointer transition-colors"
                              >
                                {addingItemId === item.id
                                  ? "…"
                                  : addedItemId === item.id
                                    ? "✓"
                                    : "+ Add"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
              Menu
            </div>

            {menu.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No menu items yet
                </h3>
              </div>
            ) : (
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                }}
              >
                {menu
                  .filter((item) => item.available !== false)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col"
                    >
                      {/* Photo */}
                      <div className="w-full h-44 bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            🍴
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                            {item.name}
                          </span>
                          {item.isSpecial && (
                            <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700">
                              Chef&apos;s Special
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          <span className="text-lg font-extrabold text-orange-500">
                            ₹{Number(item.price).toFixed(2)}
                          </span>
                          <span className={dietCls(item.dietaryRestriction)}>
                            {item.dietaryRestriction?.replace(/_/g, " ")}
                          </span>
                        </div>

                        {role === "CUSTOMER" && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingItemId === item.id}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer border-none flex items-center justify-center gap-1"
                            >
                              {addingItemId === item.id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : addedItemId === item.id ? (
                                "✓ Added!"
                              ) : (
                                "+ Add"
                              )}
                            </button>
                            {getCartQty(item.id) > 0 && (
                              <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-full px-2 py-0.5">
                                {getCartQty(item.id)} in cart
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RestaurantDetail;

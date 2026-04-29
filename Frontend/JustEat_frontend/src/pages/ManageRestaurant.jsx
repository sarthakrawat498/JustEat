import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMenu, addMenuItem } from "../api/menuApi";
import { getRestaurant } from "../api/restaurantApi";

const CUISINE_TYPES = [
  "INDIAN",
  "CHINESE",
  "JAPANESE",
  "ITALIAN",
  "MEXICAN",
  "CONTINENTAL",
  "FRENCH",
  "FAST_FOOD",
];
const DIETARY = ["VEG", "NON_VEG", "EGG", "VEGAN", "JAIN", "GLUTEN_FREE"];

const dietaryColor = {
  VEG: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700",
  NON_VEG:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700",
  EGG: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
  VEGAN:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  JAIN: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700",
  GLUTEN_FREE:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700",
};

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  cuisineType: "",
  dietaryRestriction: "",
  isSpecial: false,
};

const ManageRestaurant = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([getRestaurant(publicId), getMenu(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenuItems(mRes.data);
      })
      .catch(() => setPageError("Failed to load restaurant data."))
      .finally(() => setLoadingPage(false));
  }, [publicId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      const res = await addMenuItem(publicId, payload);
      setMenuItems((prev) => [...prev, res.data]);
      setForm(EMPTY_FORM);
      setFormSuccess("Menu item added successfully!");
      setShowForm(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to add item. Check all fields.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-2xl mx-auto mt-16 px-6">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
            {pageError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/owner-dashboard")}
            className="text-gray-400 hover:text-orange-500 text-sm transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            ← My Restaurants
          </button>
        </div>
        <div className="flex items-start justify-between mb-8 mt-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {restaurant?.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              📍 {restaurant?.location} &nbsp;·&nbsp; Manage menu items
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setFormError("");
              setFormSuccess("");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer border-none"
          >
            {showForm ? "✕ Cancel" : "+ Add Menu Item"}
          </button>
        </div>

        {/* Success message */}
        {formSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 text-sm mb-6">
            {formSuccess}
          </div>
        )}

        {/* Add Menu Item Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">
              New Menu Item
            </h2>

            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Item Name</label>
                    <input
                      name="name"
                      placeholder="e.g. Butter Chicken"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      required
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Description</label>
                  <textarea
                    name="description"
                    placeholder="Brief description of the dish"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Image URL</label>
                  <input
                    name="imageUrl"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Cuisine Type</label>
                    <select
                      name="cuisineType"
                      value={form.cuisineType}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    >
                      <option value="">Select</option>
                      {CUISINE_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Dietary</label>
                    <select
                      name="dietaryRestriction"
                      value={form.dietaryRestriction}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    >
                      <option value="">Select</option>
                      {DIETARY.map((d) => (
                        <option key={d} value={d}>
                          {d.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isSpecial"
                    checked={form.isSpecial}
                    onChange={handleChange}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Mark as Chef&apos;s Special ⭐
                  </span>
                </label>
              </div>

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all cursor-pointer border-none"
                >
                  {submitting ? "Adding…" : "Add to Menu"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items List */}
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Menu ({menuItems.length} item{menuItems.length !== 1 ? "s" : ""})
          </h2>

          {menuItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="text-sm">
                No menu items yet. Add your first item above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.name}
                      </span>
                      {item.isSpecial && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                          ⭐ Special
                        </span>
                      )}
                      {item.dietaryRestriction && (
                        <span
                          className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${dietaryColor[item.dietaryRestriction] || ""}`}
                        >
                          {item.dietaryRestriction.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {item.cuisineType?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-base font-bold text-orange-500 flex-shrink-0">
                    ₹{item.price?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRestaurant;

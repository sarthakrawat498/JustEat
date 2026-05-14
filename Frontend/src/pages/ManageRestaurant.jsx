import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../api/menuApi";
import {
  getRestaurant,
  updateRestaurantStatus,
  deleteRestaurant,
} from "../api/restaurantApi";
import ImageUpload from "../components/ImageUpload";

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

const MenuItemForm = ({
  initial,
  onSubmit,
  submitting,
  error,
  onCancel,
  isEdit,
}) => {
  const [form, setForm] = useState(initial);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">
        {isEdit ? "Edit Menu Item" : "New Menu Item"}
      </h2>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
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
              <label className={labelCls}>Price (Rs.)</label>
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
          <ImageUpload
            label="Item Image (Max 10MB)"
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            placeholder="Click to upload item photo"
          />
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
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all cursor-pointer border-none"
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Adding..."
              : isEdit
                ? "Save Changes"
                : "Add to Menu"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-all cursor-pointer bg-transparent"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const ManageRestaurant = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [statusToggling, setStatusToggling] = useState(false);
  const [restaurantDeleteConfirm, setRestaurantDeleteConfirm] = useState(false);
  const [restaurantDeleteLoading, setRestaurantDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    Promise.all([getRestaurant(publicId), getMenu(publicId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenuItems(mRes.data);
      })
      .catch(() => setPageError("Failed to load restaurant data."))
      .finally(() => setLoadingPage(false));
  }, [publicId]);

  const handleAdd = async (form) => {
    setAddError("");
    setAddSubmitting(true);
    try {
      const res = await addMenuItem(publicId, {
        ...form,
        price: parseFloat(form.price),
      });
      setMenuItems((prev) => [...prev, res.data]);
      setShowAddForm(false);
      flash("Menu item added!");
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add item.");
    } finally {
      setAddSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditError("");
    setShowAddForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = async (form) => {
    setEditError("");
    setEditSubmitting(true);
    try {
      const res = await updateMenuItem(publicId, editingItem.id, {
        ...form,
        price: parseFloat(form.price),
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? res.data : i)),
      );
      setEditingItem(null);
      flash("Changes saved!");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    try {
      await deleteMenuItem(publicId, itemId);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      flash("Item deleted.");
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleToggleSpecial = async (item) => {
    setTogglingId(item.id);
    try {
      const res = await updateMenuItem(publicId, item.id, {
        isSpecial: !item.isSpecial,
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? res.data : i)),
      );
      flash(
        `${item.name} ${!item.isSpecial ? "marked as Special ⭐" : "removed from Specials"}.`,
      );
    } catch {
      /* ignore */
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggle = async (item) => {
    setTogglingId(item.id);
    try {
      const res = await updateMenuItem(publicId, item.id, {
        isAvailable: !item.available,
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? res.data : i)),
      );
      flash(
        `${item.name} marked as ${!item.available ? "available" : "unavailable"}.`,
      );
    } catch {
      /* ignore */
    } finally {
      setTogglingId(null);
    }
  };

  const handleRestaurantStatusToggle = async () => {
    if (!restaurant) return;
    const newStatus =
      restaurant.restaurantStatus === "OPEN" ? "CLOSED" : "OPEN";
    setStatusToggling(true);
    try {
      await updateRestaurantStatus(publicId, newStatus);
      setRestaurant((r) => ({ ...r, restaurantStatus: newStatus }));
      flash(
        `Restaurant is now ${newStatus === "OPEN" ? "Open 🟢" : "Closed 🔴"}.`,
      );
    } catch (err) {
      flash(
        err?.response?.data?.message || "Failed to update restaurant status.",
      );
    } finally {
      setStatusToggling(false);
    }
  };

  const handleRestaurantDelete = async () => {
    setRestaurantDeleteLoading(true);
    try {
      await deleteRestaurant(publicId);
      navigate("/owner-dashboard");
    } catch (err) {
      setRestaurantDeleteLoading(false);
      setRestaurantDeleteConfirm(false);
      flash(err?.response?.data?.message || "Failed to delete restaurant.");
    }
  };

  if (loadingPage)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );

  if (pageError)
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

  const editInitial = editingItem
    ? {
        name: editingItem.name || "",
        description: editingItem.description || "",
        price: editingItem.price ?? "",
        imageUrl: editingItem.imageUrl || "",
        cuisineType: editingItem.cuisineType || "",
        dietaryRestriction: editingItem.dietaryRestriction || "",
        isSpecial: editingItem.isSpecial || false,
      }
    : EMPTY_FORM;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/owner-dashboard")}
          className="text-gray-400 hover:text-orange-500 text-sm transition-colors cursor-pointer bg-transparent border-none p-0 mb-2"
        >
          &larr; My Restaurants
        </button>

        <div className="flex items-start justify-between mb-6 mt-1">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {restaurant?.name}
              </h1>
              <button
                onClick={handleRestaurantStatusToggle}
                disabled={statusToggling}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  restaurant?.restaurantStatus === "OPEN"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 hover:text-red-600"
                    : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 hover:text-green-600"
                }`}
                title={`Click to ${restaurant?.restaurantStatus === "OPEN" ? "close" : "open"} restaurant`}
              >
                {statusToggling ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>
                    {restaurant?.restaurantStatus === "OPEN" ? "🟢" : "🔴"}
                  </span>
                )}
                {restaurant?.restaurantStatus ?? "OPEN"}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {restaurant?.location} &middot; Manage menu items
            </p>
          </div>
          {!editingItem && (
            <div className="flex items-center gap-2">
              {restaurantDeleteConfirm ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-700 px-2 py-1">
                  <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                    Delete restaurant?
                  </span>
                  <button
                    onClick={handleRestaurantDelete}
                    disabled={restaurantDeleteLoading}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer disabled:opacity-60"
                  >
                    {restaurantDeleteLoading ? "..." : "Yes"}
                  </button>
                  <button
                    onClick={() => setRestaurantDeleteConfirm(false)}
                    disabled={restaurantDeleteLoading}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-60"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRestaurantDeleteConfirm(true)}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Delete Restaurant
                </button>
              )}

              <button
                onClick={() => {
                  setShowAddForm((v) => !v);
                  setAddError("");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer border-none"
              >
                {showAddForm ? "Cancel" : "+ Add Menu Item"}
              </button>
            </div>
          )}
        </div>

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 text-sm mb-6">
            {successMsg}
          </div>
        )}

        {editingItem && (
          <MenuItemForm
            key={editingItem.id}
            initial={editInitial}
            onSubmit={handleEdit}
            submitting={editSubmitting}
            error={editError}
            onCancel={() => {
              setEditingItem(null);
              setEditError("");
            }}
            isEdit
          />
        )}

        {showAddForm && !editingItem && (
          <MenuItemForm
            key="add"
            initial={EMPTY_FORM}
            onSubmit={handleAdd}
            submitting={addSubmitting}
            error={addError}
            onCancel={() => {
              setShowAddForm(false);
              setAddError("");
            }}
            isEdit={false}
          />
        )}

        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            Menu ({menuItems.length} item{menuItems.length !== 1 ? "s" : ""})
          </h2>

          {menuItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-sm">
                No menu items yet. Add your first item above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 transition-opacity ${!item.available ? "opacity-60" : ""}`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.name}
                      </span>
                      {item.isSpecial && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                          Special
                        </span>
                      )}
                      {item.mostlyOrdered && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 px-2 py-0.5 rounded-full font-semibold">
                          🔥 Mostly Ordered
                        </span>
                      )}
                      {item.dietaryRestriction && (
                        <span
                          className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${dietaryColor[item.dietaryRestriction] || ""}`}
                        >
                          {item.dietaryRestriction.replace(/_/g, " ")}
                        </span>
                      )}
                      {!item.available && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-full font-semibold">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                      {item.cuisineType?.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="text-base font-bold text-orange-500 flex-shrink-0">
                    Rs. {item.price?.toFixed(2)}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(item)}
                      disabled={togglingId === item.id}
                      title={
                        item.available ? "Mark unavailable" : "Mark available"
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer bg-transparent disabled:opacity-40 ${
                        item.available
                          ? "border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {togglingId === item.id
                        ? "..."
                        : item.available
                          ? "On"
                          : "Off"}
                    </button>

                    <button
                      onClick={() => handleToggleSpecial(item)}
                      disabled={togglingId === item.id}
                      title={
                        item.isSpecial
                          ? "Remove from Today's Special"
                          : "Mark as Today's Special"
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer bg-transparent disabled:opacity-40 ${
                        item.isSpecial
                          ? "border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          : "border-gray-300 dark:border-gray-600 text-gray-400 hover:border-yellow-400 hover:text-yellow-600"
                      }`}
                    >
                      {togglingId === item.id ? "..." : "⭐"}
                    </button>

                    <button
                      onClick={() => startEdit(item)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all cursor-pointer border-none"
                    >
                      Edit
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Sure?
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer disabled:opacity-40 transition-all"
                        >
                          {deletingId === item.id ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-700 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
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

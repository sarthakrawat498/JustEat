import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRestaurants, searchRestaurants } from "../api/restaurantApi";
import { getRecommendations } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const LOCATIONS = ["ALL", "NOIDA", "DELHI", "GURGAON"];
const CUISINES = [
  "ALL",
  "INDIAN",
  "CHINESE",
  "JAPANESE",
  "ITALIAN",
  "MEXICAN",
  "CONTINENTAL",
  "FRENCH",
  "FAST_FOOD",
];

const statusCls = (status) => {
  const base =
    "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  const s = (status || "OPEN").toUpperCase();
  if (s === "OPEN")
    return `${base} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`;
  if (s === "CLOSED")
    return `${base} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`;
  return `${base} bg-yellow-100 dark:bg-yellow-900/30 text-orange-700 dark:text-orange-400`;
};

const tagCls =
  "text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-200 dark:border-orange-700 capitalize";

const selectCls =
  "border-2 border-gray-200 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-orange-500 transition-colors px-4 py-2 cursor-pointer appearance-none pr-8 font-semibold";

const isSearching = (name, location, cuisine) =>
  name.trim() !== "" || location !== "ALL" || cuisine !== "ALL";

const Home = () => {
  const { userLocation, role } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState(userLocation || "ALL");
  const [cuisine, setCuisine] = useState("ALL");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const fetchRestaurants = useCallback((n, loc, cui) => {
    setLoading(true);
    setError("");

    const searching = isSearching(n, loc, cui);
    const promise = searching
      ? searchRestaurants({
          ...(n.trim() && { keyword: n.trim() }),
          ...(loc !== "ALL" && { location: loc }),
          ...(cui !== "ALL" && { cuisine: cui }),
        })
      : getRestaurants(null);

    promise
      .then((res) => setRestaurants(res.data))
      .catch(() => setError("Failed to load restaurants."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch recommendations for customers
  useEffect(() => {
    if (role === "CUSTOMER") {
      getRecommendations()
        .then((res) => setRecommendations(res.data || []))
        .catch(() => {});
    }
  }, [role]);

  // Debounce name input
  useEffect(() => {
    const t = setTimeout(() => fetchRestaurants(name, location, cuisine), 350);
    return () => clearTimeout(t);
  }, [name, location, cuisine, fetchRestaurants]);

  const handleClear = () => {
    setName("");
    setLocation("ALL");
    setCuisine("ALL");
  };

  const hasFilters = isSearching(name, location, cuisine);

  return (
    <>
      <Navbar />
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Restaurants near you
        </h1>

        {/* Recommendations banner */}
        {role === "CUSTOMER" && recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
              ⭐ Recommended for You
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-300">
              {recommendations.map((r) => (
                <Link
                  key={r.publicId}
                  to={`/restaurant/${r.publicId}`}
                  className="shrink-0 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-3xl">
                      🍽️
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {(r.cuisineTypes || [])[0]?.replace(/_/g, " ") ||
                        "Various"}
                    </p>
                    <span className={statusCls(r.restaurantStatus)}>
                      {r.restaurantStatus || "OPEN"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Name search */}
          <div className="relative flex-1 min-w-50 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search restaurants…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Location dropdown */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={
              selectCls +
              (location !== "ALL"
                ? " border-orange-500 text-orange-600 dark:text-orange-400"
                : "")
            }
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                📍 {loc}
              </option>
            ))}
          </select>

          {/* Cuisine dropdown */}
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className={
              selectCls +
              (cuisine !== "ALL"
                ? " border-orange-500 text-orange-600 dark:text-orange-400"
                : "")
            }
          >
            {CUISINES.map((cui) => (
              <option key={cui} value={cui}>
                🍽 {cui.replace("_", " ")}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={handleClear}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 border-2 border-orange-200 dark:border-orange-700 px-4 py-2 rounded-full transition-colors cursor-pointer bg-transparent"
            >
              Clear
            </button>
          )}
        </div>

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

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              No restaurants found
            </h3>
            <p>Try a different name, location or cuisine.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {restaurants.map((r) => (
              <Link
                key={r.publicId}
                to={`/restaurant/${r.publicId}`}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all no-underline text-gray-900 dark:text-white block"
              >
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-44 bg-linear-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-5xl">
                    🍴
                  </div>
                )}
                <div className="p-4">
                  <div className="font-bold text-base mb-1">{r.name}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-3 truncate">
                    {r.description}
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                      {(r.cuisineTypes || []).slice(0, 3).map((c) => (
                        <span key={c} className={tagCls}>
                          {c.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    <span className={statusCls(r.restaurantStatus)}>
                      {r.restaurantStatus || "OPEN"}
                    </span>
                  </div>
                  {r.rating != null && (
                    <div className="flex items-center gap-1 text-sm font-bold text-orange-700 dark:text-orange-400 mt-2">
                      ★ {r.rating.toFixed(1)}
                      <span className="text-gray-400 font-normal">
                        &nbsp;({r.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

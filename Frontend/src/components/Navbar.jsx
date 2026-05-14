import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { logout, role, profileUrl, profileName } = useAuth();
  const { dark, toggle } = useTheme();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const initial = profileName ? profileName[0].toUpperCase() : "U";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-backdrop-filter:bg-white/80 shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-orange-500 no-underline shrink-0"
        >
          Just<span className="text-gray-900 dark:text-white">Eat</span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3 overflow-x-auto md:overflow-x-visible whitespace-nowrap">
          {role === "OWNER" && (
            <Link to="/create-restaurant" className="shrink-0 no-underline">
              <button className="inline-flex items-center gap-2 rounded-xl border border-orange-500 bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md cursor-pointer whitespace-nowrap">
                + <span>Add Restaurant</span>
              </button>
            </Link>
          )}

          {role === "CUSTOMER" && (
            <Link to="/orders" className="shrink-0 no-underline">
              <button
                title="My Orders"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>📋</span>
                <span>My Orders</span>
              </button>
            </Link>
          )}

          {role === "OWNER" && (
            <Link to="/owner/orders" className="shrink-0 no-underline">
              <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 cursor-pointer whitespace-nowrap shadow-sm">
                <span>Orders</span>
              </button>
            </Link>
          )}

          {role === "CUSTOMER" && (
            <Link to="/cart" className="relative shrink-0 no-underline">
              <button
                title="View Cart"
                className="relative inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>🛒</span>
                <span>My Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute right-1 top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white shadow-md">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>
            </Link>
          )}

          <button
            onClick={toggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <span>{dark ? "☀️" : "🌙"}</span>
            <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
          </button>

          {/* Avatar dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-orange-300 bg-orange-100 text-orange-500 shadow-sm transition-all duration-200 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-orange-600 dark:bg-orange-900/30 cursor-pointer shrink-0"
              title="Account"
            >
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">{initial}</span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-50 dark:border-gray-700 dark:bg-gray-800">
                {profileName && (
                  <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {profileName}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full border-none bg-transparent px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full border-none bg-transparent px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

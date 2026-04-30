import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { logout, role, profileUrl, profileName } = useAuth();
  const { dark, toggle } = useTheme();
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
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm h-16 flex items-center justify-between px-8">
      <Link
        to="/"
        className="text-2xl font-extrabold text-orange-500 tracking-tight no-underline"
      >
        Just<span className="text-gray-900 dark:text-white">Eat</span>
      </Link>

      <div className="flex items-center gap-4">
        {role === "OWNER" && (
          <Link to="/create-restaurant">
            <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all cursor-pointer bg-transparent">
              + Add Restaurant
            </button>
          </Link>
        )}

        <button
          onClick={toggle}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 w-9 h-9 rounded-lg transition-all flex items-center justify-center cursor-pointer border-none text-base"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-300 dark:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer flex-shrink-0 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
            title="Account"
          >
            {profileUrl ? (
              <img
                src={profileUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-orange-500">
                {initial}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              {profileName && (
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {profileName}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer bg-transparent border-none"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer bg-transparent border-none"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginService,
  logout as logoutService,
} from "../auth/authService";
import { getMyProfile } from "../api/userApi";
import { isTokenExpired } from "../utils/tokenUtils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [userLocation, setUserLocation] = useState(() =>
    localStorage.getItem("userLocation"),
  );
  const [profileUrl, setProfileUrl] = useState(
    () => localStorage.getItem("profileUrl") || "",
  );
  const [profileName, setProfileName] = useState(
    () => localStorage.getItem("profileName") || "",
  );

  // Calls the login API, stores the token/role/location in localStorage, and updates context state
  const login = async (credentials) => {
    const res = await loginService(credentials);
    const { token: jwt, role: userRole, userId: uid, location } = res.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    localStorage.setItem("userId", uid);
    if (location) localStorage.setItem("userLocation", location);
    setToken(jwt);
    setRole(userRole);
    setUserId(uid);
    setUserLocation(location || null);
    return res;
  };

  // Syncs the profile image URL and display name into both context state and localStorage
  const updateProfileCache = (url, name) => {
    const safeUrl = url || "";
    const safeName = name || "";
    localStorage.setItem("profileUrl", safeUrl);
    localStorage.setItem("profileName", safeName);
    setProfileUrl(safeUrl);
    setProfileName(safeName);
  };

  // Loads the latest profile data once after login/refresh so the navbar can show the user name immediately
  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      logoutService();
      setToken(null);
      setRole(null);
      setUserId(null);
      setUserLocation(null);
      setProfileUrl("");
      setProfileName("");
      localStorage.removeItem("userLocation");
      localStorage.removeItem("profileUrl");
      localStorage.removeItem("profileName");
      window.location.replace("/login");
      return;
    }

    if (profileName) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        if (cancelled) return;
        const p = res.data;
        updateProfileCache(p.profileUrl, p.firstName);
      } catch {
        // Keep the cached fallback initials if profile fetch fails.
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token, profileName]);

  // Clears all auth data from context and localStorage, logging the user out
  const logout = () => {
    logoutService();
    setToken(null);
    setRole(null);
    setUserId(null);
    setUserLocation(null);
    setProfileUrl("");
    setProfileName("");
    localStorage.removeItem("userLocation");
    localStorage.removeItem("profileUrl");
    localStorage.removeItem("profileName");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userId,
        userLocation,
        profileUrl,
        profileName,
        login,
        logout,
        updateProfileCache,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState } from "react";
import {
  login as loginService,
  logout as logoutService,
} from "../auth/authService";

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

  const updateProfileCache = (url, name) => {
    const safeUrl = url || "";
    const safeName = name || "";
    localStorage.setItem("profileUrl", safeUrl);
    localStorage.setItem("profileName", safeName);
    setProfileUrl(safeUrl);
    setProfileName(safeName);
  };

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

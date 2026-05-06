import api from "../api/axiosConfig";

// Sends login credentials and returns a JWT token + user info
export const login = (credentials) => api.post("/auth/login", credentials);

// Registers a new user account
export const register = (userData) => api.post("/auth/register", userData);

// Clears all auth data from localStorage, effectively logging the user out
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

// Sends a password reset email to the given address
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

// Resets the user's password using a one-time token from the email link
export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword });

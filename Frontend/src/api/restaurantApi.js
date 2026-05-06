import api from "./axiosConfig";

// Fetches all open restaurants, optionally filtered by location
export const getRestaurants = (location) =>
  api.get("/restaurants", { params: location ? { location } : {} });

// Fetches a single restaurant by its public ID
export const getRestaurant = (publicId) => api.get(`/restaurants/${publicId}`);

// Creates a new restaurant (owner only)
export const createRestaurant = (data) => api.post("/restaurants", data);

// Fetches all restaurants owned by the current user
export const getMyRestaurants = () => api.get("/restaurants/my");

// Updates the banner image URL of a restaurant
export const updateRestaurantImage = (publicId, imageUrl) =>
  api.patch(`/restaurants/${publicId}/image`, { imageUrl });

// Changes the open/closed status of a restaurant
export const updateRestaurantStatus = (publicId, status) =>
  api.patch(`/owner/restaurants/${publicId}/status`, { status });

// Searches restaurants by keyword, location, and/or cuisine type
export const searchRestaurants = (params) =>
  api.get("/restaurants/search", { params });

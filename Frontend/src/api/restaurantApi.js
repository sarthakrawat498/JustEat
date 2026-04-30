import api from "./axiosConfig";

export const getRestaurants = (location) =>
  api.get("/restaurants", { params: location ? { location } : {} });

export const getRestaurant = (publicId) => api.get(`/restaurants/${publicId}`);

export const createRestaurant = (data) => api.post("/restaurants", data);

export const getMyRestaurants = () => api.get("/restaurants/my");

export const updateRestaurantImage = (publicId, imageUrl) =>
  api.patch(`/restaurants/${publicId}/image`, { imageUrl });

import api from "./axiosConfig";

export const getMenu = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/menu`);

export const addMenuItem = (restaurantId, data) =>
  api.post(`/restaurants/${restaurantId}/menu`, data);

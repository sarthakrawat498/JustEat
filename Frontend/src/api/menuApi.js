import api from "./axiosConfig";

export const getMenu = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/menu`);

export const addMenuItem = (restaurantId, data) =>
  api.post(`/restaurants/${restaurantId}/menu`, data);

export const updateMenuItem = (restaurantId, menuItemId, data) =>
  api.patch(`/restaurants/${restaurantId}/menu/${menuItemId}`, data);

export const deleteMenuItem = (restaurantId, menuItemId) =>
  api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);

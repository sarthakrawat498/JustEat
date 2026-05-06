import api from "./axiosConfig";

// Fetches all available menu items for a restaurant
export const getMenu = (restaurantId) =>
  api.get(`/restaurants/${restaurantId}/menu`);

// Adds a new item to a restaurant's menu (owner only)
export const addMenuItem = (restaurantId, data) =>
  api.post(`/restaurants/${restaurantId}/menu`, data);

// Updates an existing menu item's fields (owner only)
export const updateMenuItem = (restaurantId, menuItemId, data) =>
  api.patch(`/restaurants/${restaurantId}/menu/${menuItemId}`, data);

// Deletes a menu item from the restaurant's menu (owner only)
export const deleteMenuItem = (restaurantId, menuItemId) =>
  api.delete(`/restaurants/${restaurantId}/menu/${menuItemId}`);

// Toggles the availability flag of a menu item (owner only)
export const updateMenuItemAvailability = (menuItemId, available) =>
  api.patch(`/owner/menu/${menuItemId}/availability`, { available });

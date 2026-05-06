import api from "./axiosConfig";

// Fetches the current user's cart contents
export const getCart = () => api.get("/cart");

// Adds a menu item to the cart with the given quantity
export const addToCart = (menuItemId, quantity) =>
  api.post("/cart/add-item", { menuItemId, quantity });

// Updates the quantity of an item already in the cart (0 removes it)
export const updateCartItem = (menuItemId, quantity) =>
  api.patch("/cart/update-item", { menuItemId, quantity });

// Removes a specific item from the cart entirely
export const removeCartItem = (menuItemId) =>
  api.delete(`/cart/remove-item/${menuItemId}`);

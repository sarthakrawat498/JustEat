import api from "./axiosConfig";

export const getCart = () => api.get("/cart");

export const addToCart = (menuItemId, quantity) =>
  api.post("/cart/add-item", { menuItemId, quantity });

export const updateCartItem = (menuItemId, quantity) =>
  api.patch("/cart/update-item", { menuItemId, quantity });

export const removeCartItem = (menuItemId) =>
  api.delete(`/cart/remove-item/${menuItemId}`);

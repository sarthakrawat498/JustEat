import api from "./axiosConfig";

// Places an order from the current cart
export const checkout = () => api.post("/orders/checkout");

// Fetches all past orders for the logged-in customer
export const getUserOrders = () => api.get("/orders");

// Fetches all incoming orders for the logged-in owner's restaurants
export const getOwnerOrders = () => api.get("/owner/orders");

// Updates the status of an order (owner only)
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/owner/orders/${orderId}/status`, { status });

// Re-adds all items from a past order back into the cart
export const repeatOrder = (orderId) => api.post(`/orders/${orderId}/repeat`);

// Submits a star rating (1–5) for a completed order
export const rateOrder = (orderId, rating) => api.post(`/orders/${orderId}/rate`, { rating });

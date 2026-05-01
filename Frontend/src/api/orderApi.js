import api from "./axiosConfig";

export const checkout = () => api.post("/orders/checkout");
export const getUserOrders = () => api.get("/orders");
export const getOwnerOrders = () => api.get("/owner/orders");
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/owner/orders/${orderId}/status`, { status });

import api from "./axiosConfig";

export const checkout = () => api.post("/orders/checkout");

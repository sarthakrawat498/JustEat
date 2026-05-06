import api from "./axiosConfig";

// Fetches the logged-in user's profile info
export const getMyProfile = () => api.get("/users/me");

// Updates the logged-in user's profile; maps frontend's profileUrl to profileImageUrl for the backend
export const updateMyProfile = (data) => {
  // Backend UpdateUserRequest uses profileImageUrl; map from frontend's profileUrl
  const { profileUrl, ...rest } = data;
  return api.patch("/users/me", {
    ...rest,
    ...(profileUrl !== undefined ? { profileImageUrl: profileUrl } : {}),
  });
};

// Fetches the customer's saved cuisine and dietary preferences
export const getPreferences = () => api.get("/users/me/preferences");

// Saves or updates the customer's cuisine and dietary preferences
export const savePreferences = (data) => api.put("/users/me/preferences", data);

// Fetches personalised restaurant recommendations based on the customer's preferences
export const getRecommendations = () => api.get("/users/me/recommendations");

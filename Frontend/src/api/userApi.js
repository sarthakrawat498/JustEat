import api from "./axiosConfig";

export const getMyProfile = () => api.get("/users/me");

export const updateMyProfile = (data) => {
  // Backend UpdateUserRequest uses profileImageUrl; map from frontend's profileUrl
  const { profileUrl, ...rest } = data;
  return api.patch("/users/me", {
    ...rest,
    ...(profileUrl !== undefined ? { profileImageUrl: profileUrl } : {}),
  });
};

export const getPreferences = () => api.get("/users/me/preferences");

export const savePreferences = (data) => api.put("/users/me/preferences", data);

export const getRecommendations = () => api.get("/users/me/recommendations");

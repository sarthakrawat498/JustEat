import axiosInstance from "./axiosConfig";

// Uploads an image file to Cloudinary via the backend and returns the hosted URL
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

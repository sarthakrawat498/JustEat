import { useRef, useState } from "react";
import { uploadImage } from "../api/uploadApi";

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  aspectRatio = "aspect-video",
  placeholder = "Click to upload image",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>

      {/* Clickable preview area */}
      <div
        className={`relative w-full ${aspectRatio} rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-orange-400 transition-colors`}
        onClick={() => !uploading && inputRef.current.click()}
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{placeholder}</span>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white">
              <svg
                className="animate-spin w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          </div>
        )}

        {/* Change overlay when image exists */}
        {value && !uploading && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
              Change Image
            </span>
          </div>
        )}
      </div>

      {/* When an image is set (uploaded or pasted): show Change/Remove only. Never expose the URL. */}
      {value ? (
        <div className="mt-1 flex gap-2 items-center">
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="text-xs font-semibold px-3 py-1.5 rounded border border-orange-400 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer bg-transparent"
          >
            Change
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent"
          >
            Remove
          </button>
          <span className="text-xs text-green-500 dark:text-green-400">
            Image set
          </span>
        </div>
      ) : (
        /* No image yet: allow paste URL as fallback */
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL"
          className="mt-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

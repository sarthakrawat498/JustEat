import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getMyProfile, updateMyProfile } from "../api/userApi";
import ImageUpload from "../components/ImageUpload";
import { useAuth } from "../context/AuthContext";

const LOCATIONS = ["NOIDA", "DELHI", "GURGAON"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const Profile = () => {
  const { updateProfileCache } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(res.data);
        updateProfileCache(res.data.profileUrl, res.data.firstName);
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          phoneNumber: res.data.phoneNumber || "",
          gender: res.data.gender || "",
          location: res.data.location || "",
          profileUrl: res.data.profileUrl || "",
        });
      })
      .catch(() => setPageError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res = await updateMyProfile(form);
      setProfile(res.data);
      updateProfileCache(res.data.profileUrl, res.data.firstName);
      setEditing(false);
      setSuccessMsg("Profile updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-xl mx-auto mt-16 px-6">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm">
            {pageError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* ── Hero photo card ── */}
        {(() => {
          const displayUrl = editing ? form.profileUrl : profile?.profileUrl;
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden mb-6">
              {/* Banner strip */}
              <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600" />
              {/* Avatar */}
              <div className="flex flex-col items-center -mt-14 pb-6 px-6">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                  {displayUrl ? (
                    <img
                      src={displayUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-orange-500">
                      {profile?.firstName?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-xl font-extrabold text-gray-900 dark:text-white">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.email}
                </p>
                <span className="mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700 uppercase tracking-wider">
                  {profile?.role}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Success toast */}
        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3 text-sm mb-5">
            {successMsg}
          </div>
        )}

        {/* View mode */}
        {!editing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Profile Details
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white border-none cursor-pointer transition-all"
              >
                Edit
              </button>
            </div>

            <div className="grid gap-4">
              {[
                { label: "First Name", value: profile?.firstName },
                { label: "Last Name", value: profile?.lastName },
                { label: "Phone", value: profile?.phoneNumber },
                { label: "Gender", value: profile?.gender },
                { label: "Location", value: profile?.location },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className={labelCls}>{label}</span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium break-all">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">
              Edit Profile
            </h2>

            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="">Select</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Location</label>
                    <select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="">Select</option>
                      {LOCATIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <ImageUpload
                  label="Profile Photo"
                  value={form.profileUrl}
                  onChange={(url) =>
                    setForm((f) => ({ ...f, profileUrl: url }))
                  }
                  aspectRatio="aspect-square"
                  placeholder="Click to upload profile photo"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all cursor-pointer border-none"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormError("");
                  }}
                  className="text-sm font-semibold px-5 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-all cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

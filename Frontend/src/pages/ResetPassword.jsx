import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../auth/authService";

const inputCls =
  "w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors";
const labelCls =
  "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider";

const PASSWORD_HINT =
  "At least 6 characters with uppercase, lowercase, a number and a special character (@#$%^&+=).";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    if (form.newPassword !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, form.newPassword);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired token. Please request a new reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-3xl font-extrabold text-orange-500 mb-1">
          Just<span className="text-gray-900 dark:text-white">Eat</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Reset your password
        </p>

        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Password updated!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>New password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New password"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {PASSWORD_HINT}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Confirm password</label>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="Repeat new password"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Token expired?{" "}
              <Link
                to="/forgot-password"
                className="text-orange-500 hover:text-orange-600 font-semibold"
              >
                Request a new link
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

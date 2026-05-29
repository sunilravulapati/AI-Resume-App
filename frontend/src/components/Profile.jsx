import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useUserStore from "../store/userStore";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { userRecord, updateProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

  // Load user data into the form on mount or when userRecord changes
  useEffect(() => {
    if (userRecord) {
      setValue("firstName", userRecord.firstName || "");
      setValue("lastName", userRecord.lastName || "");
      setValue("username", userRecord.username || "");
      setValue("email", userRecord.email || "");
      setValue("mobile", userRecord.mobile || "");
      setValue("githubUrl", userRecord.githubUrl || "");
      setValue("linkedinUrl", userRecord.linkedinUrl || "");
      setValue("languages", userRecord.languages ? userRecord.languages.join(", ") : "");
      setValue("preferredRoles", userRecord.preferredRoles ? userRecord.preferredRoles.join(", ") : "");
    }
  }, [userRecord, setValue]);

  if (!userRecord) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-[var(--text-secondary)]">Loading profile...</p>
      </div>
    );
  }



  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Process comma-separated inputs
      const payload = {
        ...data,
        languages: data.languages
          ? data.languages.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        preferredRoles: data.preferredRoles
          ? data.preferredRoles.split(",").map(s => s.trim()).filter(Boolean)
          : [],
      };

      // Only send password if user explicitly typed one
      if (!data.password || data.password.trim() === "") {
        delete payload.password;
      }

      await updateProfile(payload);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const dashboardPath =
    userRecord.role === "recruiter"
      ? "/recruiter-dashboard"
      : userRecord.role === "admin"
      ? "/admin-dashboard"
      : "/student-dashboard";

  const inputBase =
    "w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 transition-all duration-200";

  return (
    <div className="min-h-[85vh] py-12 px-6 sm:px-8 bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(dashboardPath)}
          className="group flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors mb-6 cursor-pointer"
        >
          <svg
            className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="glass-panel rounded-3xl shadow-xl overflow-hidden border border-[var(--border)] relative">
          <div className="absolute -top-px left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--color-accent)] to-[#5ac8fa]" />
          
          <div className="p-8 sm:p-10">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--border)] pb-6 mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Profile Settings
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Update your contact details, resume credentials, and job preferences.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-brand-50)] text-[var(--color-accent)] uppercase tracking-wider">
                {userRecord.role}
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Section */}
              <div>
                <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      {...register("firstName", {
                        required: "First Name is required",
                        pattern: { value: /^[A-Za-z]+$/, message: "Only alphabets allowed" }
                      })}
                      className={inputBase}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      {...register("lastName", {
                        required: "Last Name is required",
                        pattern: { value: /^[A-Za-z]+$/, message: "Only alphabets allowed" }
                      })}
                      className={inputBase}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">Username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      {...register("username", {
                        required: "Username is required",
                        pattern: {
                          value: /^[A-Za-z][A-Za-z0-9]*$/,
                          message: "Must start with a letter and contain only letters/numbers"
                        }
                      })}
                      className={inputBase}
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      {...register("email", {
                        required: "Please enter a valid email address.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address."
                        }
                      })}
                      className={inputBase}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Mobile"
                      {...register("mobile", { required: "Required" })}
                      className={inputBase}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
                      New Password <span className="text-[10px] text-[var(--text-muted)] font-normal">(Leave empty to keep current)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        {...register("password", {
                          minLength: { value: 6, message: "Min 6 characters" }
                        })}
                        className={inputBase}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6" />

              {/* Developer Links Section */}
              <div>
                <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                  Developer Profiles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">GitHub URL</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
                        🔗
                      </div>
                      <input
                        type="text"
                        placeholder="https://github.com/username"
                        {...register("githubUrl")}
                        className={`${inputBase} pl-9`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">LinkedIn URL</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">
                        🔗
                      </div>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/username"
                        {...register("linkedinUrl")}
                        className={`${inputBase} pl-9`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-6" />

              {/* Professional Interests Section */}
              <div>
                <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                  Preferences & Interests
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
                      Languages Known <span className="text-[10px] text-[var(--text-muted)] font-normal">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. English, Hindi, Spanish"
                      {...register("languages")}
                      className={inputBase}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">
                      Preferred Job Roles <span className="text-[10px] text-[var(--text-muted)] font-normal">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Developer, ML Engineer, Backend Developer"
                      {...register("preferredRoles")}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 justify-end border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="premium-btn cursor-pointer min-w-[140px] justify-center"
                >
                  {loading ? "Saving Settings..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

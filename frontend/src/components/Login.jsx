import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useUserStore from '../store/userStore';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { fetchUser, userRecord } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onUserLogin = async (userCredObj) => {
    setLoading(true);
    setError(null);
    try {
      const resObj = await axios.post("/api/user/login", {
        loginIdentifier: userCredObj.email,
        password: userCredObj.password
      });

      const { token } = resObj.data;
      localStorage.setItem('token', token);
      await fetchUser();
      toast.success("Logged in successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRecord) {
      if (userRecord.role === 'student') navigate('/student-dashboard');
      else if (userRecord.role === 'recruiter') navigate('/recruiter-dashboard');
      else if (userRecord.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    }
  }, [userRecord, navigate]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="relative bg-white border border-[#e8e8ed]/80 rounded-3xl shadow-xl shadow-black/5 p-10 sm:p-12 transition-colors duration-300">

          {/* Decorative gradient blob */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-1 rounded-b-full bg-linear-to-r from-[#0066cc] to-[#5ac8fa]" />

          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center shadow-lg shadow-[#0066cc]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div> */}
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-[#8e8e93]">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-[#ff3b30]/6 border border-[#ff3b30]/15 rounded-xl px-4 py-3">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="text-sm text-[#cc2f26]">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onUserLogin)} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <path d="M22 7L13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="your@email.com"
                  {...register("email", { required: "Email or username is required" })}
                  className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-3 text-[#1d1d1f] text-sm placeholder:text-[#c7c7cc] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/15 transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p className="text-[#ff3b30] text-xs mt-1.5 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className="w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl pl-10 pr-10 py-3 text-[#1d1d1f] text-sm placeholder:text-[#c7c7cc] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/15 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6] hover:text-[#6e6e73] transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[#ff3b30] text-xs mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0066cc] to-[#0077ed] hover:from-[#004499] hover:to-[#0066cc] shadow-md shadow-[#0066cc]/25 hover:shadow-lg hover:shadow-[#0066cc]/30 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-7 text-center">
            <p className="text-sm text-[#8e8e93]">
              Don't have an account?{" "}
              <NavLink to="/register" className="text-[#0066cc] hover:text-[#004499] font-medium transition-colors">
                Create one
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
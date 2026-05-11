import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formObj) => {
    setLoading(true);
    setError(null);
    try {
      const resObj = await axios.post("http://localhost:4000/api/user/register", formObj);
      if (resObj.status === 201) {
        toast.success("Registration successful! Please login.");
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1d1d1f] text-sm placeholder:text-[#c7c7cc] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/15 transition-all duration-200";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="relative bg-white border border-[#e8e8ed]/80 rounded-3xl shadow-xl shadow-black/5 p-10 sm:p-12">
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-1 rounded-b-full bg-gradient-to-r from-[#0066cc] to-[#5ac8fa]" />
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#34c759] to-[#30d158] flex items-center justify-center shadow-lg shadow-[#34c759]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C12.79 4 11 5.79 11 8C11 10.21 12.79 12 15 12ZM6 10V7H4V10H1V12H4V15H6V12H9V10H6ZM15 14C12.33 14 7 15.34 7 18V20H23V18C23 15.34 17.67 14 15 14Z" fill="white" fillOpacity="0.9"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-1">Create Account</h1>
            <p className="text-sm text-[#8e8e93]">Get started with your free account</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 bg-[#ff3b30]/6 border border-[#ff3b30]/15 rounded-xl px-4 py-3">
              <span className="text-sm shrink-0">⚠️</span>
              <p className="text-sm text-[#cc2f26]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">First Name</label>
                <input type="text" placeholder="John" {...register("firstName", { required: "Required" })} className={inputBase} />
                {errors.firstName && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">Last Name</label>
                <input type="text" placeholder="Doe" {...register("lastName", { required: "Required" })} className={inputBase} />
                {errors.lastName && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">Username</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input type="text" placeholder="johndoe" {...register("username", { required: "Username is required" })} className={`${inputBase} pl-10`} />
              </div>
              {errors.username && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7L13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input type="email" placeholder="john@example.com" {...register("email", { required: "Email is required" })} className={`${inputBase} pl-10`} />
              </div>
              {errors.email && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                </div>
                <input type="text" placeholder="+1 (555) 000-0000" {...register("mobile", { required: "Required" })} className={`${inputBase} pl-10`} />
              </div>
              {errors.mobile && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">I am a…</label>
              <select {...register("role", { required: "Select a role" })} className={`${inputBase} cursor-pointer`}>
                <option value="">Select your role…</option>
                <option value="student">Student / Job Seeker</option>
                <option value="recruiter">Recruiter / Hiring Manager</option>
                <option value="faculty">Faculty</option>
              </select>
              {errors.role && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.role.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a1a1a6]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type="password" placeholder="Min 6 characters" {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 characters" } })} className={`${inputBase} pl-10`} />
              </div>
              {errors.password && <p className="text-[#ff3b30] text-xs mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0066cc] to-[#0077ed] hover:from-[#004499] hover:to-[#0066cc] shadow-md shadow-[#0066cc]/25 hover:shadow-lg hover:shadow-[#0066cc]/30 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-[#8e8e93]">
              Already have an account?{" "}
              <NavLink to="/login" className="text-[#0066cc] hover:text-[#004499] font-medium transition-colors">Sign in</NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
import { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router";
import useUserStore from "../store/userStore";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  const { userRecord } = useUserStore();
  const [countdown, setCountdown] = useState(10);

  const getRedirectPath = () => {
    if (!userRecord) return "/";
    if (userRecord.role === "recruiter") return "/recruiter-dashboard";
    if (userRecord.role === "admin") return "/admin-dashboard";
    return "/student-dashboard";
  };

  const getRedirectLabel = () => {
    if (!userRecord) return "Return Home";
    return "Go to Dashboard";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(getRedirectPath(), { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userRecord]);

  // Determine error status and message
  let statusCode = "404";
  let errorMessage = "Oops! The page you are looking for could not be found.";

  if (error) {
    statusCode = error.status || "500";
    errorMessage = error.statusText || error.message || "An unexpected system error occurred.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <div className="w-full max-w-lg relative">
        {/* Glow decorations */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[var(--color-brand-300)] opacity-20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-300 opacity-20 blur-[80px] rounded-full" />

        <div className="glass-panel rounded-3xl shadow-xl p-8 sm:p-10 relative overflow-hidden border border-[var(--border)] text-center">
          {/* Top colored strip */}
          <div className="absolute -top-px left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-[var(--color-accent)] to-indigo-600 animate-pulse-soft" />

          {/* Large Animated Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 rounded-2xl bg-red-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[bounce_2s_infinite]">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          {/* Status Code */}
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-widest mb-3">
            Status Error {statusCode}
          </span>

          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Path Unresolved
          </h1>

          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-8 leading-relaxed">
            {errorMessage}
          </p>

          {/* Progress circle / Timer indicator */}
          <div className="flex items-center justify-center gap-3 bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl p-4 mb-8 max-w-xs mx-auto">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--color-accent)]"></span>
            </span>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Redirecting you in <span className="font-extrabold text-[var(--color-accent)] text-sm">{countdown}</span> seconds...
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={() => navigate(getRedirectPath(), { replace: true })}
              className="premium-btn w-full sm:w-auto justify-center cursor-pointer shadow-indigo"
            >
              {getRedirectLabel()}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)] transition-all duration-200 w-full sm:w-auto cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

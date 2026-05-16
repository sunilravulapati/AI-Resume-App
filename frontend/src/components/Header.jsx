import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import useUserStore from "../store/userStore";

function Header() {
  const { userRecord, clearUser } = useUserStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/");
    setMenuOpen(false);
  };

  const dashboardPath =
    userRecord?.role === "recruiter"
      ? "/recruiter-dashboard"
      : userRecord?.role === "admin"
      ? "/admin-dashboard"
      : "/student-dashboard";

  const firstName = userRecord?.firstName || userRecord?.name?.split(" ")[0];
  const initial = firstName?.charAt(0)?.toUpperCase() || "?";

  const navLinkStyle = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]"
    }`;

  return (
    <header className="glass-panel sticky top-0 z-50 border-b-0">
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 h-[72px] flex items-center justify-between">

        {/* ─── Brand ─── */}
        <NavLink to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent)] flex items-center justify-center shadow-soft group-hover:shadow-hover transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2H15C15.55 2 16 2.45 16 3V5H20C21.1 5 22 5.9 22 7V10C22 11.1 21.1 12 20 12H16V13C16 13.55 15.55 14 15 14H9C8.45 14 8 13.55 8 13V12H4C2.9 12 2 11.1 2 10V7C2 5.9 2.9 5 4 5H8V3C8 2.45 8.45 2 9 2Z" fill="white" fillOpacity="0.95"/>
              <rect x="4" y="15" width="16" height="2" rx="1" fill="white" fillOpacity="0.8"/>
              <rect x="6" y="19" width="12" height="2" rx="1" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
          <span className="text-[1.25rem] font-display font-bold tracking-tight bg-gradient-to-r from-[var(--color-brand-700)] to-[var(--color-accent)] bg-clip-text text-transparent">
            ResumeAI
          </span>
        </NavLink>

        {/* ─── Desktop Nav ─── */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink to="/" end className={navLinkStyle}>
            Home
          </NavLink>

          {userRecord ? (
            <>
              <NavLink to={dashboardPath} className={navLinkStyle}>
                Dashboard
              </NavLink>

              <div className="w-px h-5 bg-[var(--border)] mx-3" />

              {/* User pill */}
              <div className="flex items-center gap-3 pl-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {initial}
                </div>
                <div className="hidden md:block mr-2">
                  <p className="text-sm font-semibold text-[var(--text)] leading-tight">
                    {firstName || "User"}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-tight capitalize">
                    {userRecord.role}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-1 px-4 py-2 rounded-full text-sm font-medium text-[var(--danger)] bg-[var(--danger-soft)] hover:bg-[#FECACA] transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkStyle}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="ml-3 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-brand-500)] hover:from-[var(--color-brand-700)] hover:to-[var(--color-accent)] shadow-soft hover:shadow-hover transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>

        {/* ─── Mobile Hamburger ─── */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg hover:bg-[var(--bg-muted)] gap-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-[8px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          />
        </button>
      </div>

      {/* ─── Mobile Dropdown Menu ─── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
        role="dialog" aria-modal="true"
      >
        <div className="bg-[var(--bg-elevated)] border-t border-[var(--border)] px-6 py-6 flex flex-col gap-2 shadow-soft">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-5 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
              }`
            }
          >
            Home
          </NavLink>

          {userRecord ? (
            <>
              <NavLink
                to={dashboardPath}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  }`
                }
              >
                Dashboard
              </NavLink>

              <div className="border-t border-[var(--border)] my-3" />

              {/* User info */}
              <div className="flex items-center gap-4 px-5 py-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                  {initial}
                </div>
                <div>
                  <p className="text-base font-semibold text-[var(--text)]">
                    {firstName || "User"}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] capitalize">
                    {userRecord.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="mx-5 mt-2 px-5 py-3 rounded-xl text-base font-bold text-[var(--danger)] bg-[var(--danger-soft)] hover:bg-[#FECACA] transition-colors text-center cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mx-5 mt-3 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-brand-500)] text-center shadow-soft"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
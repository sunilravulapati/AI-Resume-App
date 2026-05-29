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
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-brand-50)] text-[var(--color-accent)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-muted)]"
    }`;

  return (
    <header className="glass-panel sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 h-[68px] flex items-center justify-between">

        {/* ─── Brand ─── */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" fillOpacity="0.95"/>
              <polyline points="14,2 14,8 20,8" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
            </svg>
          </div>
          <span className="text-[1.15rem] font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
            ResumeAI
          </span>
        </NavLink>

        {/* ─── Desktop Nav ─── */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/" end className={navLinkStyle}>Home</NavLink>

          {userRecord ? (
            <>
              <NavLink to={dashboardPath} className={navLinkStyle}>Dashboard</NavLink>
              <NavLink to="/profile" className={navLinkStyle}>Profile</NavLink>

              <div className="w-px h-5 bg-[var(--border)] mx-3" />

              <div className="flex items-center gap-2.5 pl-1">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  {initial}
                </div>
                <div className="hidden md:block mr-1">
                  <p className="text-sm font-semibold text-[var(--text)] leading-tight">
                    {firstName || "User"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] leading-tight capitalize">
                    {userRecord.role}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkStyle}>Login</NavLink>
              <NavLink
                to="/register"
                className="ml-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>

        {/* ─── Mobile Hamburger ─── */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-[var(--bg-muted)] gap-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-5 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-[var(--text)] rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
        </button>
      </div>

      {/* ─── Mobile Dropdown ─── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-[var(--bg-elevated)] border-t border-[var(--border)] px-5 py-5 flex flex-col gap-1.5 shadow-soft">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-[var(--color-brand-50)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
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
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-[var(--color-brand-50)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-[var(--color-brand-50)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  }`
                }
              >
                Profile
              </NavLink>
              <div className="border-t border-[var(--border)] my-2" />
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-sm">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{firstName || "User"}</p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">{userRecord.role}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="mx-4 mt-1 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--danger)] bg-[var(--danger-soft)] hover:bg-[#FECACA] transition-colors text-center cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-[var(--color-brand-50)] text-[var(--color-accent)]" : "text-[var(--text)] hover:bg-[var(--bg-muted)]"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mx-4 mt-1 px-5 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-center shadow-sm"
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
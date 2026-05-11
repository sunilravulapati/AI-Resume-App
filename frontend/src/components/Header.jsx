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
    `px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all duration-200 ${
      isActive
        ? "bg-[#0066cc]/8 text-[#0066cc]"
        : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-[#e8e8ed]/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto w-full px-6 sm:px-8 h-[64px] flex items-center justify-between">

        {/* ─── Brand ─── */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center shadow-sm shadow-[#0066cc]/20 group-hover:shadow-md group-hover:shadow-[#0066cc]/30 transition-shadow duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2H15C15.55 2 16 2.45 16 3V5H20C21.1 5 22 5.9 22 7V10C22 11.1 21.1 12 20 12H16V13C16 13.55 15.55 14 15 14H9C8.45 14 8 13.55 8 13V12H4C2.9 12 2 11.1 2 10V7C2 5.9 2.9 5 4 5H8V3C8 2.45 8.45 2 9 2Z" fill="white" fillOpacity="0.9"/>
              <rect x="4" y="15" width="16" height="2" rx="1" fill="white" fillOpacity="0.7"/>
              <rect x="6" y="19" width="12" height="2" rx="1" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <span className="text-[1.1rem] font-bold tracking-tight bg-gradient-to-r from-[#0066cc] to-[#5ac8fa] bg-clip-text text-transparent">
            ResumeAI
          </span>
        </NavLink>

        {/* ─── Desktop Nav ─── */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/" end className={navLinkStyle}>
            Home
          </NavLink>

          {userRecord ? (
            <>
              <NavLink to={dashboardPath} className={navLinkStyle}>
                Dashboard
              </NavLink>

              <div className="w-px h-5 bg-[#e8e8ed] mx-2" />

              {/* User pill */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                  {initial}
                </div>
                <div className="hidden md:block mr-1">
                  <p className="text-[0.78rem] font-semibold text-[#1d1d1f] leading-tight">
                    {firstName || "User"}
                  </p>
                  <p className="text-[0.65rem] text-[#8e8e93] leading-tight capitalize">
                    {userRecord.role}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-1 px-3.5 py-1.5 rounded-full text-[0.78rem] font-medium text-[#ff3b30] bg-[#ff3b30]/6 hover:bg-[#ff3b30]/12 transition-colors duration-200 cursor-pointer"
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
                className="ml-2 px-5 py-2 rounded-full text-[0.82rem] font-semibold text-white bg-gradient-to-r from-[#0066cc] to-[#0077ed] hover:from-[#004499] hover:to-[#0066cc] shadow-sm shadow-[#0066cc]/25 hover:shadow-md hover:shadow-[#0066cc]/30 transition-all duration-300 cursor-pointer"
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>

        {/* ─── Mobile Hamburger ─── */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-[#f5f5f7] gap-[5px] cursor-pointer transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-[18px] h-[2px] bg-[#1d1d1f] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[2px] bg-[#1d1d1f] rounded-full transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-[18px] h-[2px] bg-[#1d1d1f] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {/* ─── Mobile Dropdown Menu ─── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#e8e8ed]/60 px-6 py-5 flex flex-col gap-1 shadow-lg shadow-black/5">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-xl text-[0.85rem] font-medium transition-colors ${
                isActive ? "bg-[#0066cc]/8 text-[#0066cc]" : "text-[#3a3a3c] hover:bg-[#f5f5f7]"
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
                  `px-4 py-2.5 rounded-xl text-[0.85rem] font-medium transition-colors ${
                    isActive ? "bg-[#0066cc]/8 text-[#0066cc]" : "text-[#3a3a3c] hover:bg-[#f5f5f7]"
                  }`
                }
              >
                Dashboard
              </NavLink>

              <div className="border-t border-[#e8e8ed]/60 my-2" />

              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066cc] to-[#5ac8fa] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {initial}
                </div>
                <div>
                  <p className="text-[0.82rem] font-semibold text-[#1d1d1f]">
                    {firstName || "User"}
                  </p>
                  <p className="text-[0.7rem] text-[#8e8e93] capitalize">
                    {userRecord.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="mx-4 mt-1 px-4 py-2.5 rounded-xl text-[0.85rem] font-medium text-[#ff3b30] bg-[#ff3b30]/6 hover:bg-[#ff3b30]/12 transition-colors text-center cursor-pointer"
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
                  `px-4 py-2.5 rounded-xl text-[0.85rem] font-medium transition-colors ${
                    isActive ? "bg-[#0066cc]/8 text-[#0066cc]" : "text-[#3a3a3c] hover:bg-[#f5f5f7]"
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mx-4 mt-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-semibold text-white bg-gradient-to-r from-[#0066cc] to-[#0077ed] text-center shadow-sm shadow-[#0066cc]/20"
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
import { NavLink, useNavigate } from "react-router";
import useUserStore from "../store/userStore";

function Header() {
  const { userRecord, clearUser } = useUserStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    clearUser(); 
    navigate("/");
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          ResumeAI
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `font-medium transition ${isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`
            }
          >
            Home
          </NavLink>

          {userRecord ? (
            <>
              <NavLink
                to={userRecord.role === 'recruiter' ? "/recruiter-dashboard" : "/student-dashboard"}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleSignOut}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <NavLink to="/login" className="text-gray-600 hover:text-blue-600 font-medium self-center">
                Login
              </NavLink>
              <NavLink to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm">
                Get Started
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
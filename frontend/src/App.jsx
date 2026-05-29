import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Resume from "./components/Resume";
import Profile from "./components/Profile";
import ErrorPage from "./components/ErrorPage";

import useUserStore from "./store/userStore";

// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { userRecord, loading } = useUserStore();

  // Still fetching the profile on first load
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-[var(--bg)]">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
          <svg className="w-5 h-5 animate-spin text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Loading your workspace…</p>
      </div>
    );
  }

  // No profile = not authenticated (cookie missing or expired)
  if (!userRecord) {
    return <Navigate to="/login" replace />;
  }

  // Correct authenticated user but wrong role for this route
  if (role && userRecord.role !== role) {
    const roleRoutes = {
      recruiter: '/recruiter-dashboard',
      admin: '/admin-dashboard',
      student: '/student-dashboard',
    };
    const home = roleRoutes[userRecord.role] ?? '/';
    return <Navigate to={home} replace />;
  }

  return children;
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      {
        path: "student-dashboard",
        element: (
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "recruiter-dashboard",
        element: (
          <ProtectedRoute role="recruiter">
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )
      },

      {
        path: "resume/:id",
        element: (
          <ProtectedRoute>
            <Resume />
          </ProtectedRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Catch-all to display custom Error Page for unmatched paths
  { path: "*", element: <ErrorPage /> },
]);

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem",
            borderRadius: "999px",
            padding: "10px 18px",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}
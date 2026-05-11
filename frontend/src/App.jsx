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

import useUserStore from "./store/userStore";

// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { userRecord, loading } = useUserStore();

  // Still fetching the profile on first load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#6e6e73] text-sm">
        Loading…
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
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
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
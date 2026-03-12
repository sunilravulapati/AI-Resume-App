import { createBrowserRouter, RouterProvider, Navigate } from "react-router"; // Using latest react-router
import { Toaster } from "react-hot-toast";

import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";

import useUserStore from "./store/userStore";

function ProtectedRoute({ children, role }) {
  const { userRecord, loading } = useUserStore();
  const token = localStorage.getItem("token");

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (!userRecord) return <div className="text-center mt-10">Syncing Profile...</div>;

  if (role && userRecord.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { path: "", element: <Home /> },
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
      ],
    },
    { path: "*", element: <Navigate to="/" /> },
  ]);

  return (
    <>
      <Toaster position="top-center" />
      <RouterProvider router={routerObj} />
    </>
  );
}

export default App;
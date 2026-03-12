import { NavLink } from "react-router";

function Home() {
  return (
    <div className="text-center max-w-4xl mx-auto">

      <h1 className="text-5xl font-bold text-gray-800 mb-6">
        AI Powered Resume Analyzer
      </h1>

      <p className="text-gray-500 text-lg mb-10">
        Get ATS scores, AI feedback, and improve your resume instantly.
      </p>

      <NavLink
        to="/login"
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
      >
        Get Started
      </NavLink>

    </div>
  )
}

export default Home
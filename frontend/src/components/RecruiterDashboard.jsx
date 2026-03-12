function RecruiterDashboard() {
  return (
    <div className="max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Recruiter Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Search Candidates</h2>
          <p className="text-gray-500">
            Browse resumes and find suitable candidates.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Post Job</h2>
          <p className="text-gray-500">
            Post job descriptions to match resumes.
          </p>
        </div>

      </div>

    </div>
  );
}

export default RecruiterDashboard;
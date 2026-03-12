import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cardClass, headingClass, primaryBtn, secondaryBtn, formCard } from '../styles/common';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'

  // Upload State
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch History when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get("http://localhost:4000/api/resume/history", {
        withCredentials: true // Important for cookies!
      });
      setHistory(res.data);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a PDF!");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setAnalysis(null);
    try {
      const res = await axios.post("http://localhost:4000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      setAnalysis(res.data.analysis);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className={`${headingClass} mb-8`}>Student Dashboard</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('upload')}
          className={activeTab === 'upload' ? primaryBtn : secondaryBtn}
        >
          Analyze Resume
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? primaryBtn : secondaryBtn}
        >
          Resume History
        </button>
      </div>

      {/* UPLOAD TAB CONTENT */}
      {activeTab === 'upload' && (
        <div className={formCard}>
          <h2 className="text-xl font-bold mb-4">Upload New Resume</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 block w-full text-sm text-gray-500"
          />
          <button onClick={handleUpload} disabled={loading} className={primaryBtn}>
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>

          {analysis && (
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold mb-2">Score: <span className="text-blue-600">{analysis.atsScore}/100</span></h3>
              <p className="italic text-gray-600 mb-6">{analysis.summary}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-green-600">Strengths</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-600">Improvements</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {analysis.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB CONTENT */}
      {activeTab === 'history' && (
        <div>
          {loadingHistory ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No resumes analyzed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div key={item._id} className={cardClass}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">Score: {item.atsScore}/100</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.feedback?.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
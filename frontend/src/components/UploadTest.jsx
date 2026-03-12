import { useState } from 'react';
import axios from 'axios';

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [parsedText, setParsedText] = useState("");
  const [analysis, setAnalysis] = useState(null); // NEW: State to hold the AI analysis
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a resume PDF first!");

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setAnalysis(null); // Clear previous results
    
    try {
      const response = await axios.post("http://localhost:4000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Store BOTH the raw text and the AI analysis
      setParsedText(response.data.rawText);
      setAnalysis(response.data.analysis); 
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check your backend console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-4xl mx-auto mt-10 bg-white">
      <h2 className="text-2xl font-bold mb-4">1. Test PDF Extraction & AI Analysis</h2>
      
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange} 
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      <button 
        onClick={handleUpload} 
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
      >
        {loading ? "Analyzing Resume with AI..." : "Upload & Analyze"}
      </button>

      {/* --- NEW: Display the AI Analysis Results --- */}
      {analysis && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">AI Resume Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">ATS Score:</span>
              <span className={`text-2xl font-black ${analysis.atsScore >= 75 ? 'text-green-600' : analysis.atsScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {analysis.atsScore}/100
              </span>
            </div>
          </div>

          <p className="text-gray-700 italic mb-6">"{analysis.summary}"</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white p-4 rounded border border-green-100 shadow-sm">
              <h4 className="font-bold text-green-700 mb-2">Top Strengths</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white p-4 rounded border border-orange-100 shadow-sm">
              <h4 className="font-bold text-orange-700 mb-2">Areas for Improvement</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {analysis.improvements.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Keep the raw text display at the bottom for debugging */}
      {parsedText && (
        <div className="mt-8">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-gray-500 hover:text-gray-700">View Raw Extracted Text</summary>
            <textarea 
              className="w-full h-48 mt-2 p-3 border rounded bg-gray-100 text-xs font-mono text-gray-600" 
              readOnly 
              value={parsedText} 
            />
          </details>
        </div>
      )}
    </div>
  );
}
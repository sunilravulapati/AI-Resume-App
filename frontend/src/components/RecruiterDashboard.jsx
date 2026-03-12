import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  headingClass, cardClass, loadingClass,
  primaryBtn, secondaryBtn, mutedText, bodyText, emptyStateClass
} from '../styles/common';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'name' | 'date'

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/resume/all", {
        withCredentials: true
      });
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load candidate pool");
    } finally {
      setLoading(false);
    }
  };

  // Score helpers
  const scoreBadge = (score) => {
    if (score >= 75) return 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20';
    if (score >= 50) return 'bg-[#ff9f0a]/10 text-[#b86e00] border border-[#ff9f0a]/20';
    return 'bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20';
  };
  const scoreLabel = (score) => {
    if (score >= 75) return '✅ Strong';
    if (score >= 50) return '⚠️ Average';
    return '❌ Weak';
  };

  // Filter + Sort
  const filtered = candidates
    .filter(r => {
      const name = `${r.userId?.firstName} ${r.userId?.lastName}`.toLowerCase();
      const email = r.userId?.email?.toLowerCase() || '';
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.atsScore - a.atsScore;
      if (sortBy === 'name') return `${a.userId?.firstName}`.localeCompare(`${b.userId?.firstName}`);
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  if (loading) return <p className={loadingClass}>Loading talent pool…</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-[#e8e8ed] pb-6">
        <div>
          <h1 className={`${headingClass} text-3xl mb-1`}>Talent Pool</h1>
          <p className={`${bodyText} text-sm`}>Browse and evaluate candidates from their resume analysis scores.</p>
        </div>
        <span className="bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 text-sm font-bold px-4 py-1.5 rounded-full self-start sm:self-auto">
          {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'}
        </span>
      </div>

      {/* SEARCH + SORT CONTROLS */}
      {candidates.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
          />
          <div className="flex gap-2">
            {[
              { key: 'score', label: '↓ Score' },
              { key: 'name', label: 'A–Z Name' },
              { key: 'date', label: '🕐 Recent' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={sortBy === opt.key ? `${primaryBtn}` : `${secondaryBtn}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {candidates.length === 0 ? (
        <div className={emptyStateClass}>
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium text-[#6e6e73]">No candidates have uploaded resumes yet.</p>
          <p className={`${mutedText} mt-1`}>Check back once students start submitting.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={emptyStateClass}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-[#6e6e73]">No candidates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((resume) => {
            const student = resume.userId;
            const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Unknown';

            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/resume/${resume._id}`)}
                className={`${cardClass} flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-all duration-200`}
              >
                {/* Header: Avatar initial + Name + Score badge */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-sm font-bold shrink-0 uppercase">
                      {student?.firstName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1d1d1f] leading-tight truncate">{fullName}</h3>
                      <p className={`${mutedText} text-xs truncate`}>{student?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${scoreBadge(resume.atsScore)}`}>
                    {resume.atsScore}/100
                  </span>
                </div>

                {/* Score bar */}
                <div className="w-full bg-[#e8e8ed] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      resume.atsScore >= 75 ? 'bg-[#34c759]' :
                      resume.atsScore >= 50 ? 'bg-[#ff9f0a]' : 'bg-[#ff3b30]'
                    }`}
                    style={{ width: `${resume.atsScore}%` }}
                  />
                </div>

                {/* AI Summary snippet */}
                <p className="text-xs text-[#6e6e73] leading-relaxed line-clamp-2 italic">
                  "{resume.feedback?.summary}"
                </p>

                {/* Top 2 strengths */}
                {resume.feedback?.strengths?.length > 0 && (
                  <div>
                    <p className={`${mutedText} text-[0.6rem] uppercase tracking-wider font-semibold mb-1.5`}>Top Strengths</p>
                    <ul className="space-y-1">
                      {resume.feedback.strengths.slice(0, 2).map((s, i) => (
                        <li key={i} className="text-xs text-[#1d1d1f] flex items-start gap-1.5">
                          <span className="text-[#34c759] shrink-0 mt-0.5">✓</span>
                          <span className="line-clamp-1">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#e8e8ed]">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[0.65rem] font-semibold uppercase tracking-wider ${scoreBadge(resume.atsScore).split(' ').slice(1).join(' ')}`}>
                      {scoreLabel(resume.atsScore)}
                    </span>
                  </div>
                  <span className="text-xs text-[#0066cc] font-medium flex items-center gap-1">
                    View Profile →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
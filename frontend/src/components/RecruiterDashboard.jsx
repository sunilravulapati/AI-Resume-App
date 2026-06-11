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
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'name' | 'date' | 'match'
  
  // AI JD Screening states
  const [jdText, setJdText] = useState('');
  const [screening, setScreening] = useState(false);
  const [aiMatches, setAiMatches] = useState({}); // map of candidateId -> match details
  const [isJdOpen, setIsJdOpen] = useState(false);

  // Invite Modal states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get("/api/resume/all", {
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

  // Run AI Screener / Matcher
  const handleJdScreening = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      return toast.error("Please enter a Job Description or search criteria first!");
    }

    setScreening(true);
    const toastId = toast.loading("AI is screening candidates against your criteria...");
    try {
      const res = await axios.post("/api/resume/match-pool", 
        { jobDescription: jdText },
        { withCredentials: true }
      );

      if (res.data?.matches) {
        const matchesMap = {};
        res.data.matches.forEach(m => {
          matchesMap[m.id] = {
            matchScore: m.matchScore,
            suitability: m.suitability,
            explanation: m.explanation
          };
        });
        setAiMatches(matchesMap);
        setSortBy('match'); // Automatically sort by match rate
        toast.success("AI talent screening complete!", { id: toastId });
      } else {
        toast.error("No matches returned from AI ranking", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to screen candidates with AI. Please try again.", { id: toastId });
    } finally {
      setScreening(false);
    }
  };

  const clearJdFilter = () => {
    setJdText('');
    setAiMatches({});
    setSortBy('score');
    toast.success("AI filter cleared");
  };

  // Open invite modal
  const openInviteModal = (candidate, resumeId) => {
    const fullName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate';
    setSelectedCandidate({ ...candidate, resumeId });
    setEmailSubject(`Interview Invitation: Full-Stack Developer Position at Talented Recruitment`);
    setEmailBody(`Dear ${fullName},\n\nWe recently reviewed your tailored resume in our Talent Pool and were exceptionally impressed with your technical experience and achievements.\n\nWe would love to invite you for a 30-minute virtual interview to discuss our open positions and learn more about your background.\n\nPlease let us know your availability over the next few days.\n\nBest regards,\nRecruitment Team\nTalented Recruitment Org`);
  };

  // Send Invitation
  const sendInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setSendingInvite(true);
    try {
      await axios.post("/api/resume/invite-candidate", {
        resumeId: selectedCandidate.resumeId,
        emailSubject,
        emailBody
      }, { withCredentials: true });

      toast.success(`Simulated interview invitation sent to ${selectedCandidate.email}! Check backend logs.`);
      setSelectedCandidate(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setSendingInvite(false);
    }
  };

  // Score badges
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

  const suitabilityBadge = (suitability) => {
    if (suitability === "Strong Match") return 'bg-[#34c759] text-white';
    if (suitability === "Good Match") return 'bg-[#0066cc] text-white';
    if (suitability === "Potential Match") return 'bg-[#ff9f0a] text-white';
    return 'bg-[#ff3b30] text-white';
  };

  // Filter + Sort Candidates
  const filtered = candidates
    .filter(r => {
      const name = `${r.userId?.firstName} ${r.userId?.lastName}`.toLowerCase();
      const email = r.userId?.email?.toLowerCase() || '';
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        const matchA = aiMatches[a._id]?.matchScore || 0;
        const matchB = aiMatches[b._id]?.matchScore || 0;
        return matchB - matchA;
      }
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
          <h1 className={`${headingClass} text-3xl mb-1`}>Recruiter Talent Pool</h1>
          <p className={`${bodyText} text-sm`}>Browse candidate profiles, use AI matching filters, and invite top talent directly.</p>
        </div>
        <span className="bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 text-sm font-bold px-4 py-1.5 rounded-full self-start sm:self-auto">
          {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'}
        </span>
      </div>

      {/* AI JD SCREENING PANEL */}
      <div className="mb-8 bg-[#f5f5f7] border border-[#d2d2d7] rounded-2xl p-5 overflow-hidden transition-all duration-300">
        <button
          onClick={() => setIsJdOpen(!isJdOpen)}
          className="w-full flex items-center justify-between font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <span>AI Job Description Matching & Candidate Screening</span>
            {Object.keys(aiMatches).length > 0 && (
              <span className="bg-[#34c759] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                AI Filter Active
              </span>
            )}
          </div>
          <span className="text-xl">{isJdOpen ? '▲' : '▼'}</span>
        </button>

        {isJdOpen && (
          <form onSubmit={handleJdScreening} className="mt-4 pt-4 border-t border-[#e8e8ed] flex flex-col gap-3">
            <p className="text-xs text-[#6e6e73]">
              Paste your target Job Description, keys, or criteria below. Our Llama 3 model will screen and evaluate all uploaded resumes against this content, returning a bespoke match rate and suitability summary for each candidate.
            </p>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="e.g. Seeking a Senior Backend Engineer with 5+ years of Python/Django experience, AWS deployment proficiency, and microservices architecture expertise..."
              rows={4}
              className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition resize-none"
            />
            <div className="flex gap-2.5 self-end">
              {Object.keys(aiMatches).length > 0 && (
                <button
                  type="button"
                  onClick={clearJdFilter}
                  className={`${secondaryBtn} px-5 py-2`}
                >
                  Clear AI Filter
                </button>
              )}
              <button
                type="submit"
                disabled={screening}
                className={`${primaryBtn} flex items-center gap-1.5 px-6 py-2`}
              >
                {screening ? "Screening Pool..." : "Screen Pool with AI"}
              </button>
            </div>
          </form>
        )}
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
              ...(Object.keys(aiMatches).length > 0 ? [{ key: 'match', label: '🔥 AI Match' }] : []),
              { key: 'score', label: '↓ ATS Score' },
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

      {/* EMPTY STATES */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resume) => {
            const student = resume.userId;
            const fullName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Unknown';
            const hasMatch = aiMatches[resume._id] !== undefined;
            const matchDetails = aiMatches[resume._id];

            return (
              <div
                key={resume._id}
                className={`${cardClass} flex flex-col gap-4 p-6 border border-[#e8e8ed] hover:border-[#a1a1a6] hover:shadow-xl transition-all duration-300 relative group`}
              >
                {/* Header: Avatar initial + Name + Score badge */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-sm font-bold shrink-0 uppercase">
                      {student?.firstName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1d1d1f] leading-tight truncate">{fullName}</h3>
                      <p className={`${mutedText} text-xs truncate`}>{student?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${scoreBadge(resume.atsScore)}`}>
                    {resume.atsScore}/100 ATS
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

                {/* DYNAMIC AI JD SCREENING DETAILS */}
                {hasMatch ? (
                  <div className="bg-white border border-[#d2d2d7] rounded-xl p-3.5 flex flex-col gap-2 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1d1d1f] flex items-center gap-1">
                        🎯 AI Match Rating:
                      </span>
                      <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${suitabilityBadge(matchDetails.suitability)}`}>
                        {matchDetails.matchScore}% - {matchDetails.suitability}
                      </span>
                    </div>
                    <p className="text-xs text-[#6e6e73] leading-relaxed italic">
                      "{matchDetails.explanation}"
                    </p>
                  </div>
                ) : (
                  /* AI Summary snippet if AI JD filter is not active */
                  <p className="text-xs text-[#6e6e73] leading-relaxed line-clamp-3 italic bg-white/50 border border-[#e8e8ed] rounded-xl p-3">
                    "{resume.feedback?.summary || 'No summary available.'}"
                  </p>
                )}

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

                {/* Recruiter feedback segment (Green / Red Flags) */}
                {resume.feedback?.recruiterFeedback?.greenFlags?.length > 0 && (
                  <div className="mt-auto">
                    <p className={`${mutedText} text-[0.6rem] uppercase tracking-wider font-semibold mb-1.5`}>Recruiter Insights</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-[#34c759]/10 text-[#248a3d] font-medium">
                        🟢 {resume.feedback.recruiterFeedback.greenFlags.length} Green Flags
                      </span>
                      {resume.feedback.recruiterFeedback.redFlags?.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded bg-[#ff3b30]/10 text-[#cc2f26] font-medium">
                          🔴 {resume.feedback.recruiterFeedback.redFlags.length} Red Flags
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e8e8ed] gap-2">
                  <button
                    onClick={() => openInviteModal(student, resume._id)}
                    className={`${primaryBtn} flex-1 py-1.5 text-center text-xs whitespace-nowrap bg-[#0066cc]`}
                  >
                    ✉️ Invite
                  </button>
                  <button
                    onClick={() => navigate(`/resume/${resume._id}`)}
                    className={`${secondaryBtn} flex-1 py-1.5 text-center text-xs whitespace-nowrap border-[#d2d2d7] hover:bg-[#ebebf0]`}
                  >
                    Profile →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED INTERVIEW INVITE MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d2d2d7] overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Invite for Interview</h2>
                <p className="text-xs text-[#6e6e73] mt-0.5">Send a simulated interview invitation directly to this candidate's inbox.</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-[#86868b] hover:text-[#1d1d1f] text-xl font-bold focus:outline-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={sendInvite} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">To:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedCandidate.firstName} ${selectedCandidate.lastName} <${selectedCandidate.email}>`}
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm text-[#86868b] focus:outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Subject:</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Message:</label>
                <textarea
                  required
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2.5 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className={`${secondaryBtn} px-5 py-2`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className={`${primaryBtn} px-6 py-2 bg-[#0066cc]`}
                >
                  {sendingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
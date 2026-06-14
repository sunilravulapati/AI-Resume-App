import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import {
  headingClass, cardClass, loadingClass,
  primaryBtn, secondaryBtn, mutedText, bodyText, emptyStateClass
} from '../styles/common';
import {
  InboxIcon, SearchIcon, MailIcon, FlameIcon, ClockIcon,
  AlertTriangleIcon, XCircleIcon,
} from './icons';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { userRecord } = useUserStore();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'name' | 'date' | 'match'
  
  // AI Role-Based Screening states
  const [roleName, setRoleName] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Student');
  const [screening, setScreening] = useState(false);
  const [aiMatches, setAiMatches] = useState({}); // map of candidateId -> match details
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [activeRequirements, setActiveRequirements] = useState(null);

  // Invite Modal states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteRoleName, setInviteRoleName] = useState('');
  const [inviteCompanyName, setInviteCompanyName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
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

  // Run AI Role Matcher / Screener
  const handleRoleBasedScreening = async (e) => {
    if (e) e.preventDefault();
    if (!roleName.trim()) {
      return toast.error("Please enter a Role Name!");
    }
    if (!requiredSkills.trim()) {
      return toast.error("Please enter at least one Required Skill!");
    }

    setScreening(true);
    const toastId = toast.loading("AI is screening candidates for this role...");
    try {
      const res = await axios.post("/api/resume/match-pool", 
        { 
          roleName: roleName.trim(),
          requiredSkills: requiredSkills.trim(),
          preferredSkills: preferredSkills.trim(),
          experienceLevel
        },
        { withCredentials: true }
      );

      if (res.data?.matches) {
        const matchesMap = {};
        res.data.matches.forEach(m => {
          matchesMap[m.id] = {
            matchScore: m.matchScore,
            atsScore: m.atsScore,
            suitability: m.recommendation, // Option: Strong Match, Potential Match, Needs Review, Low Match
            explanation: m.explanation || "",
            whyMatches: m.whyMatches || [],
            missingSkills: m.missingSkills || [],
            matchedSkills: m.matchedSkills || [],
            skillMatchScore: m.skillMatchScore || 0,
            projectRelevanceScore: m.projectRelevanceScore || 0,
            resumeQualityScore: m.resumeQualityScore || 0,
            recommendation: m.recommendation || "Needs Review"
          };
        });
        setAiMatches(matchesMap);
        setSortBy('match'); // Automatically sort by match rate
        setSearchSubmitted(true);
        setActiveRequirements({
          roleName: roleName.trim(),
          requiredSkills: requiredSkills.trim(),
          preferredSkills: preferredSkills.trim(),
          experienceLevel
        });
        toast.success("AI role match screening complete!", { id: toastId });
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

  const clearFilters = () => {
    setRoleName('');
    setRequiredSkills('');
    setPreferredSkills('');
    setExperienceLevel('Student');
    setAiMatches({});
    setSearchSubmitted(false);
    setActiveRequirements(null);
    setSortBy('score');
    toast.success("Hiring requirements reset");
  };

  // Open invite modal
  const openInviteModal = (candidate, resumeId) => {
    const fullName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate';
    const role = activeRequirements?.roleName || roleName.trim() || 'Open Position';
    setSelectedCandidate({ ...candidate, resumeId });
    setInviteRoleName(role);
    setInviteCompanyName('');
    setInviteMessage(
      `Dear ${fullName},\n\nWe recently reviewed your resume in our talent pool and were impressed with your technical experience and achievements.\n\nWe would love to invite you for a virtual interview to discuss the ${role} role and learn more about your background.\n\nPlease let us know your availability over the next few days.\n\nBest regards,\n${userRecord ? `${userRecord.firstName} ${userRecord.lastName}`.trim() : 'Recruitment Team'}`
    );
  };

  // Send Invitation via real email API
  const sendInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    if (!inviteRoleName.trim()) return toast.error('Please enter a role name.');
    if (!inviteCompanyName.trim()) return toast.error('Please enter a company name.');

    const recruiterName = userRecord ? `${userRecord.firstName} ${userRecord.lastName}`.trim() : 'Recruiter';
    const recruiterEmail = userRecord?.email || '';
    const candidateName = `${selectedCandidate.firstName || ''} ${selectedCandidate.lastName || ''}`.trim() || 'Candidate';

    setSendingInvite(true);
    const toastId = toast.loading('Sending interview invitation...');
    try {
      await axios.post('/api/invitations/send', {
        recruiterName,
        recruiterEmail,
        candidateName,
        candidateEmail: selectedCandidate.email,
        roleName: inviteRoleName.trim(),
        companyName: inviteCompanyName.trim(),
        customMessage: inviteMessage.trim(),
      }, { withCredentials: true });

      toast.success(`Interview invitation sent to ${selectedCandidate.email}`, { id: toastId });
      setSelectedCandidate(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send invitation. Please try again.', { id: toastId });
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

  const suitabilityBadge = (suitability) => {
    if (suitability === "Strong Match") return 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20';
    if (suitability === "Potential Match") return 'bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20';
    if (suitability === "Needs Review") return 'bg-[#ff9f0a]/10 text-[#b86e00] border border-[#ff9f0a]/20';
    return 'bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20';
  };

  // Filter + Sort Candidates
  const filtered = candidates
    .filter(r => {
      const name = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
      const email = r.email?.toLowerCase() || '';
      return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'match') {
        const matchA = aiMatches[a.candidateId]?.matchScore || 0;
        const matchB = aiMatches[b.candidateId]?.matchScore || 0;
        return matchB - matchA;
      }
      if (sortBy === 'score') return b.latestAtsScore - a.latestAtsScore;
      if (sortBy === 'name') return `${a.firstName || ''}`.localeCompare(`${b.firstName || ''}`);
      if (sortBy === 'date') return new Date(b.latestUploadDate || 0) - new Date(a.latestUploadDate || 0);
      return 0;
    });

  if (loading) return <p className={loadingClass}>Loading talent pool…</p>;

  // Requirements form view
  if (!searchSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Recruiter Candidate Screening</h1>
          <p className="text-sm text-[#6e6e73]">Define your target hiring requirements to rank candidates by custom role fit.</p>
        </div>

        <form onSubmit={handleRoleBasedScreening} className="bg-[#f5f5f7] border border-[#d2d2d7] rounded-3xl p-8 shadow-md flex flex-col gap-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-[#1d1d1f]">Hiring Requirements</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6e6e73]">Role Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Frontend Developer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
            />
            {/* suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'ML Engineer', 'Java Developer'].map(role => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setRoleName(role)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    roleName === role 
                      ? 'bg-[#0066cc] text-white border-[#0066cc]' 
                      : 'bg-white text-[#1d1d1f] border-[#d2d2d7] hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6e6e73]">Required Skills (comma separated)</label>
            <input
              type="text"
              required
              placeholder="e.g. React, Next.js, Java"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {['React', 'Next.js', 'Java', 'Spring Boot', 'Python', 'MongoDB', 'TypeScript', 'Tailwind CSS'].map(skill => {
                const skillsList = requiredSkills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                const isSelected = skillsList.includes(skill.toLowerCase());
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => {
                      const list = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
                      if (isSelected) {
                        setRequiredSkills(list.filter(s => s.toLowerCase() !== skill.toLowerCase()).join(', '));
                      } else {
                        setRequiredSkills([...list, skill].join(', '));
                      }
                    }}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-[#0066cc] text-white border-[#0066cc]'
                        : 'bg-white text-[#1d1d1f] border-[#d2d2d7] hover:bg-slate-50'
                    }`}
                  >
                    + {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6e6e73]">Preferred Skills (Optional, comma separated)</label>
            <input
              type="text"
              placeholder="e.g. AWS, Docker, Kubernetes"
              value={preferredSkills}
              onChange={(e) => setPreferredSkills(e.target.value)}
              className="bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6e6e73]">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="bg-white border border-[#d2d2d7] rounded-xl px-4 py-3 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition cursor-pointer"
            >
              <option value="Student">Student</option>
              <option value="Fresher">Fresher</option>
              <option value="Internship Experience">Internship Experience</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setSearchSubmitted(true);
                setAiMatches({});
              }}
              className="flex-1 border border-[#d2d2d7] text-[#1d1d1f] font-semibold py-3 rounded-full hover:bg-white/55 transition-colors cursor-pointer text-sm text-center"
            >
              Show All Candidates (Unfiltered)
            </button>
            <button
              type="submit"
              disabled={screening}
              className="flex-1 bg-[#0066cc] text-white font-semibold py-3 rounded-full hover:bg-[#004499] transition-colors cursor-pointer text-sm text-center"
            >
              {screening ? "Screening Pool..." : "Screen Pool with AI"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">

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

      {/* ACTIVE SEARCH BANNER */}
      {activeRequirements ? (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-[#0066cc]/15 text-[#0066cc] border border-[#0066cc]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active AI Fit Filter
              </span>
              <span className="bg-[#34c759] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                Sorted by Fit Match
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mt-2">
              Role Fit: {activeRequirements.roleName}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Required: <span className="font-semibold text-slate-800">{activeRequirements.requiredSkills}</span>
              {activeRequirements.preferredSkills && <> | Preferred: <span className="font-semibold text-slate-800">{activeRequirements.preferredSkills}</span></>}
              {activeRequirements.experienceLevel && <> | Level: <span className="font-semibold text-slate-800">{activeRequirements.experienceLevel}</span></>}
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setSearchSubmitted(false)}
              className="border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 font-medium px-4 py-1.5 rounded-full text-xs transition"
            >
              Edit Requirements
            </button>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-full text-xs transition"
            >
              Reset Search
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex justify-between items-center transition-all">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Viewing All Candidates (Unfiltered)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Candidates are sorted by general ATS Score by default.</p>
          </div>
          <button
            onClick={() => setSearchSubmitted(false)}
            className={`${primaryBtn} text-xs px-4 py-1.5 bg-[#0066cc]`}
          >
            Run AI Screening
          </button>
        </div>
      )}

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
              ...(Object.keys(aiMatches).length > 0 ? [{ key: 'match', label: 'AI Match', Icon: FlameIcon }] : []),
              { key: 'score', label: 'ATS Score' },
              { key: 'name', label: 'Name' },
              { key: 'date', label: 'Recent', Icon: ClockIcon },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`${sortBy === opt.key ? primaryBtn : secondaryBtn} inline-flex items-center gap-1.5`}
              >
                {opt.Icon && <opt.Icon size={13} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EMPTY STATES */}
      {candidates.length === 0 ? (
        <div className={emptyStateClass}>
          <InboxIcon size={40} className="mx-auto mb-3 text-[#a1a1a6]" />
          <p className="font-medium text-[#6e6e73]">No candidates have uploaded resumes yet.</p>
          <p className={`${mutedText} mt-1`}>Check back once students start submitting.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={emptyStateClass}>
          <SearchIcon size={40} className="mx-auto mb-3 text-[#a1a1a6]" />
          <p className="font-medium text-[#6e6e73]">No candidates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((candidate) => {
            const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown';
            const hasMatch = aiMatches[candidate.candidateId] !== undefined;
            const matchDetails = aiMatches[candidate.candidateId];

            return (
              <div
                key={candidate.candidateId}
                className={`${cardClass} flex flex-col gap-4 p-6 border border-[#e8e8ed] hover:border-[#a1a1a6] hover:shadow-xl transition-all duration-300 relative group`}
              >
                {/* Header: Avatar initial + Name + Suitability tag */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center text-sm font-bold shrink-0 uppercase">
                      {candidate.firstName?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1d1d1f] leading-tight truncate">{fullName}</h3>
                      <p className={`${mutedText} text-xs truncate`}>{candidate.email}</p>
                    </div>
                  </div>
                  {hasMatch ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${suitabilityBadge(matchDetails.recommendation)}`}>
                      {matchDetails.recommendation}
                    </span>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-slate-100 text-slate-700 border border-slate-200`}>
                      Candidate
                    </span>
                  )}
                </div>

                {/* Score Diagnostics - Side by Side layout when Match is active */}
                {hasMatch && (
                  <div className="grid grid-cols-2 gap-2 text-center bg-white border border-[#e8e8ed] rounded-xl p-3 shadow-sm">
                    <div className="flex flex-col items-center justify-center border-r border-[#e8e8ed]">
                      <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider">Role Match</span>
                      <span className="text-xl font-extrabold text-[#0066cc] mt-0.5">{matchDetails.matchScore}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider">ATS Score</span>
                      <span className="text-xl font-extrabold text-slate-800 mt-0.5">{candidate.latestAtsScore}%</span>
                    </div>
                  </div>
                )}

                {/* Candidate Stats List */}
                <div className="bg-white border border-[#e8e8ed] rounded-xl p-3.5 flex flex-col gap-2 transition-all text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6e6e73]">Resume Versions:</span>
                    <span className="font-semibold text-[#1d1d1f]">{candidate.resumesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6e6e73]">Latest ATS:</span>
                    <span className="font-semibold text-[#1d1d1f]">{candidate.latestAtsScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6e6e73]">Best ATS:</span>
                    <span className="font-semibold text-[#1d1d1f]">{candidate.bestAtsScore}%</span>
                  </div>
                  {candidate.latestUploadDate && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100 mt-1">
                      <span className="text-[#6e6e73]">Latest Upload:</span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {new Date(candidate.latestUploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Role Match Breakdown Section */}
                {hasMatch && matchDetails.matchedSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wider mb-1">Role Match Breakdown</p>
                    <ul className="space-y-1">
                      {matchDetails.matchedSkills.map((skill, i) => (
                        <li key={i} className="text-xs text-[#1d1d1f] flex items-start gap-1">
                          <span className="text-[#34c759] shrink-0 font-bold">✓</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Section */}
                {hasMatch && matchDetails.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-[#cc2f26] uppercase tracking-wider mb-1">Missing</p>
                    <ul className="space-y-1">
                      {matchDetails.missingSkills.map((missing, i) => (
                        <li key={i} className="text-xs text-[#1d1d1f] flex items-start gap-1">
                          <span className="text-[#ff3b30] shrink-0"><AlertTriangleIcon size={12} /></span>
                          <span>{missing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#e8e8ed] gap-2 mt-auto">
                  <button
                    onClick={() => openInviteModal(candidate, candidate.defaultResumeId)}
                    className={`${primaryBtn} flex-1 py-1.5 text-center text-xs whitespace-nowrap bg-[#0066cc] inline-flex items-center justify-center gap-1.5`}
                  >
                    <MailIcon size={13} /> Invite
                  </button>
                  <button
                    onClick={() => navigate(`/resume/${candidate.defaultResumeId}`, { 
                      state: { 
                        matchDetails: matchDetails ? { 
                          ...matchDetails, 
                          roleName, 
                          requiredSkills, 
                          preferredSkills, 
                          experienceLevel 
                        } : null 
                      } 
                    })}
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
      
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#d2d2d7] overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">Invite for Interview</h2>
                <p className="text-xs text-[#6e6e73] mt-0.5">Send an interview invitation directly to this candidate.</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-[#86868b] hover:text-[#1d1d1f] p-1 focus:outline-none"
                aria-label="Close"
              >
                <XCircleIcon size={20} />
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
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Role Name:</label>
                <input
                  type="text"
                  required
                  value={inviteRoleName}
                  onChange={(e) => setInviteRoleName(e.target.value)}
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Company Name:</label>
                <input
                  type="text"
                  required
                  value={inviteCompanyName}
                  onChange={(e) => setInviteCompanyName(e.target.value)}
                  placeholder="Your company or organization"
                  className="w-full bg-white border border-[#d2d2d7] rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/10 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6e6e73] mb-1 block">Message:</label>
                <textarea
                  required
                  rows={8}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
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
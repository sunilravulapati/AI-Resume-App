import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  cardClass, headingClass, primaryBtn, secondaryBtn,
  inputClass, labelClass, mutedText, bodyText,
  loadingClass, emptyStateClass,
} from '../styles/common';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Unknown';
const safeDate = (d) => {
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

// ─── Score helpers (mirrors StudentDashboard) ─────────────────────────────────
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20';
  if (score >= 50) return 'bg-[#ff9f0a]/10 text-[#b86e00] border border-[#ff9f0a]/20';
  return 'bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20';
};
const scoreLabel = (score) => {
  if (score >= 75) return '✅ Strong';
  if (score >= 50) return '⚠️ Average';
  return '❌ Needs Work';
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent = '#0066cc' }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm px-5 py-4 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${accent}14` }}
      >
        {icon}
      </div>
      <div>
        <p className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5`}>{label}</p>
        <p className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserModal({ user, onClose, navigate }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-[#e8e8ed] px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] font-bold text-sm">
              {fullName(user).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-[#1d1d1f] text-sm">{fullName(user)}</p>
              <p className={`${mutedText} text-xs`}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${secondaryBtn} px-3 py-1.5 text-xs`}
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f5f5f7] rounded-xl p-3">
              <p className={`${mutedText} text-[0.6rem] uppercase tracking-wider font-semibold mb-1`}>Role</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                user.role === 'admin'
                  ? 'bg-[#bf5af2]/10 text-[#9b40cc] border border-[#bf5af2]/20'
                  : user.role === 'recruiter'
                  ? 'bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20'
                  : 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20'
              }`}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
            <div className="bg-[#f5f5f7] rounded-xl p-3">
              <p className={`${mutedText} text-[0.6rem] uppercase tracking-wider font-semibold mb-1`}>Member Since</p>
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {safeDate(user.createdAt)}
              </p>
            </div>
          </div>

          {/* Resume history */}
          <div>
            <p className={`${mutedText} uppercase tracking-wider text-[0.65rem] font-semibold mb-3`}>
              Resume History ({user.resumes?.length || 0})
            </p>
            {!user.resumes?.length ? (
              <div className="text-center py-6 bg-[#f5f5f7] rounded-2xl">
                <p className="text-2xl mb-1">📭</p>
                <p className={`${mutedText} text-sm`}>No resumes uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {user.resumes.map((resume, i) => (
                  <div
                    key={resume._id}
                    onClick={() => { navigate(`/resume/${resume._id}`); onClose(); }}
                    className="flex items-center justify-between bg-[#f5f5f7] hover:bg-[#ebebef] rounded-xl px-4 py-3 cursor-pointer transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${mutedText} text-xs font-semibold`}>#{user.resumes.length - i}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#1d1d1f]">
                          {resume.roleName
                            ? `${resume.company ? resume.company + ' · ' : ''}${resume.roleName}`
                            : 'General Analysis'}
                        </p>
                        <p className={`${mutedText} text-xs`}>
                          {new Date(resume.createdAt).toLocaleDateString()}
                          {resume.analysisMode === 'targeted' && ' · 🎯 Targeted'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${scoreBadge(resume.atsScore)}`}>
                        {resume.atsScore}/100
                      </span>
                      <span className="text-[#0066cc] text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [sortBy,      setSortBy]      = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);

  // ── Fetch all users on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/admin/users', { withCredentials: true });
      setUsers(res.data.users);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access denied — admins only.');
        navigate('/');
      } else {
        toast.error('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalResumes    = users.reduce((sum, u) => sum + (u.resumes?.length || 0), 0);
  const avgScore        = (() => {
    const allScores = users.flatMap(u => u.resumes?.map(r => r.atsScore) || []);
    if (!allScores.length) return '—';
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  })();
  const studentCount   = users.filter(u => u.role === 'student').length;
  const recruiterCount = users.filter(u => u.role === 'recruiter').length;

  // ── Filtering & sorting ───────────────────────────────────────────────────
  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        fullName(u).toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'mostResumes') return (b.resumes?.length || 0) - (a.resumes?.length || 0);
      if (sortBy === 'highScore') {
        const avgA = a.resumes?.length ? a.resumes.reduce((s, r) => s + r.atsScore, 0) / a.resumes.length : 0;
        const avgB = b.resumes?.length ? b.resumes.reduce((s, r) => s + r.atsScore, 0) / b.resumes.length : 0;
        return avgB - avgA;
      }
      return 0;
    });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50" onClick={() => setSelectedUser(null)}>
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            navigate={navigate}
          />
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#bf5af2]/10 text-[#9b40cc] border border-[#bf5af2]/20">
              🛡 Admin
            </span>
          </div>
          <h1 className={`${headingClass} text-3xl mb-1`}>Admin Dashboard</h1>
          <p className={`${bodyText} text-sm`}>Manage all users, view resume histories, and monitor platform activity.</p>
        </div>
        <button
          onClick={fetchUsers}
          className={`${secondaryBtn} px-4 py-2 text-sm flex items-center gap-1.5`}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard icon="👥" label="Total Users"     value={users.length}    accent="#0066cc" />
        <StatCard icon="📄" label="Total Resumes"   value={totalResumes}    accent="#248a3d" />
        <StatCard icon="🎓" label="Students"        value={studentCount}    accent="#0066cc" />
        <StatCard icon="💼" label="Avg. ATS Score"  value={avgScore}        accent="#ff9f0a" />
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} max-w-xs py-2 text-sm`}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`${inputClass} w-auto py-2 text-sm`}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="recruiter">Recruiters</option>
          <option value="admin">Admins</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`${inputClass} w-auto py-2 text-sm`}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostResumes">Most Resumes</option>
          <option value="highScore">Highest Avg. Score</option>
        </select>

        {(search || roleFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('all'); }}
            className={`${secondaryBtn} px-3 py-2 text-xs`}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Result count */}
      {!loading && (
        <p className={`${mutedText} text-xs mb-4`}>
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* Table / Cards */}
      {loading ? (
        <p className={loadingClass}>Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className={emptyStateClass}>
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-[#6e6e73]">No users match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#f5f5f7] border-b border-[#e8e8ed] text-[0.65rem] font-semibold text-[#6e6e73] uppercase tracking-wider">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Resumes</span>
            <span>Avg. Score</span>
            <span>Joined</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#f0f0f5]">
            {filtered.map((user) => {
              const resumeCount = user.resumes?.length || 0;
              const avgUserScore = resumeCount
                ? Math.round(user.resumes.reduce((s, r) => s + r.atsScore, 0) / resumeCount)
                : null;

              return (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 items-center cursor-pointer hover:bg-[#f5f5f7] transition-colors duration-150 group"
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] font-bold text-xs shrink-0">
                      {fullName(user).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#1d1d1f] truncate group-hover:text-[#0066cc] transition-colors">
                      {fullName(user)}
                    </span>
                  </div>

                  {/* Email */}
                  <span className={`${mutedText} text-xs truncate`}>{user.email}</span>

                  {/* Role badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold w-fit ${
                    user.role === 'admin'
                      ? 'bg-[#bf5af2]/10 text-[#9b40cc] border border-[#bf5af2]/20'
                      : user.role === 'recruiter'
                      ? 'bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20'
                      : 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20'
                  }`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>

                  {/* Resume count */}
                  <span className="text-sm font-semibold text-[#1d1d1f]">{resumeCount}</span>

                  {/* Avg score */}
                  {avgUserScore !== null ? (
                    <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold w-fit ${scoreBadge(avgUserScore)}`}>
                      {avgUserScore}/100
                    </span>
                  ) : (
                    <span className={`${mutedText} text-xs`}>—</span>
                  )}

                  {/* Joined */}
                  <span className={`${mutedText} text-xs`}>
                    {safeDate(user.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
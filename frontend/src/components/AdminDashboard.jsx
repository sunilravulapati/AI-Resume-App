import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  cardClass, headingClass, primaryBtn, secondaryBtn,
  inputClass, labelClass, mutedText, bodyText,
  loadingClass, emptyStateClass,
} from '../styles/common';
import {
  UsersIcon, GraduationCapIcon, BriefcaseIcon, FileTextIcon, SparklesIcon,
  SearchIcon, InboxIcon, ShieldIcon, RefreshIcon,
} from './icons';

// Helpers
const fullName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Unknown';
const safeDate = (d) => {
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

// Score helpers (mirrors StudentDashboard)
const scoreBadge = (score) => {
  if (score >= 75) return 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20';
  if (score >= 50) return 'bg-[#ff9f0a]/10 text-[#b86e00] border border-[#ff9f0a]/20';
  return 'bg-[#ff3b30]/10 text-[#cc2f26] border border-[#ff3b30]/20';
};
const scoreLabel = (score) => {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Average';
  return 'Needs Work';
};

// Stat Card
function StatCard({ Icon, label, value, accent = '#0066cc' }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm px-5 py-4 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}14`, color: accent }}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <p className={`${mutedText} text-[0.65rem] uppercase tracking-wider font-semibold mb-0.5`}>{label}</p>
        <p className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// User Detail Modal
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
                <InboxIcon size={28} className="mx-auto mb-2 text-slate-300" />
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
                          {resume.analysisMode === 'targeted' && ' · Targeted'}
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

// Main Component
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [sortBy,      setSortBy]      = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);

  // Stats and activity states
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users', { withCredentials: true }),
        axios.get('/api/admin/stats', { withCredentials: true })
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
      setRecentUsers(statsRes.data.recentUsers);
      setRecentUploads(statsRes.data.recentUploads);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access denied — admins only.');
        navigate('/');
      } else {
        toast.error('Failed to load admin dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Stats mapping fallback
  const totalResumes    = stats?.totalResumes ?? users.reduce((sum, u) => sum + (u.resumes?.length || 0), 0);
  const avgScore        = (() => {
    const allScores = users.flatMap(u => u.resumes?.map(r => r.atsScore) || []);
    if (!allScores.length) return '—';
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  })();
  const studentCount   = stats?.totalStudents ?? users.filter(u => u.role === 'student').length;
  const recruiterCount = stats?.totalRecruiters ?? users.filter(u => u.role === 'recruiter').length;

  // Filtering & sorting
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

  // Main Content
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">

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
      <div className="flex items-start justify-between mb-8 border-b border-[#e8e8ed] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#bf5af2]/10 text-[#9b40cc] border border-[#bf5af2]/20 inline-flex items-center gap-1">
              <ShieldIcon size={12} /> Admin
            </span>
          </div>
          <h1 className={`${headingClass} text-3xl mb-1`}>Admin Dashboard</h1>
          <p className={`${bodyText} text-sm`}>Manage all users, view resume histories, and monitor platform activity.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className={`${secondaryBtn} px-4 py-2 text-sm flex items-center gap-1.5`}
        >
          <RefreshIcon size={14} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard Icon={UsersIcon} label="Total Users" value={stats?.totalUsers ?? users.length} accent="#0066cc" />
        <StatCard Icon={GraduationCapIcon} label="Students" value={studentCount} accent="#34c759" />
        <StatCard Icon={BriefcaseIcon} label="Recruiters" value={recruiterCount} accent="#bf5af2" />
        <StatCard Icon={FileTextIcon} label="Resumes Uploaded" value={totalResumes} accent="#ff9f0a" />
        <StatCard Icon={SparklesIcon} label="Tailored Sessions" value={stats?.totalSessions ?? '—'} accent="#5856d6" />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User Directory */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">User Directory</h2>
            {!loading && (
              <span className="text-xs bg-[#f5f5f7] border border-[#e8e8ed] text-[#6e6e73] px-2.5 py-1 rounded-full font-bold">
                {filtered.length} of {users.length}
              </span>
            )}
          </div>

          {/* Filters bar */}
          <div className="flex flex-wrap gap-2 mb-2">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} flex-1 min-w-[150px] py-1.5 text-xs`}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`${inputClass} w-auto py-1.5 text-xs`}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${inputClass} w-auto py-1.5 text-xs`}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="mostResumes">Most Resumes</option>
              <option value="highScore">Highest Avg</option>
            </select>

            {(search || roleFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setRoleFilter('all'); }}
                className={`${secondaryBtn} px-2.5 py-1.5 text-[10px]`}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Table / Cards */}
          {loading ? (
            <p className={loadingClass}>Loading users…</p>
          ) : filtered.length === 0 ? (
            <div className={emptyStateClass}>
              <SearchIcon size={36} className="mx-auto mb-3 text-[#a1a1a6]" />
              <p className="font-medium text-[#6e6e73]">No users match your filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e8e8ed] shadow-sm overflow-hidden transition-all duration-300">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-3 px-4 py-2.5 bg-[#f5f5f7] border-b border-[#e8e8ed] text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider">
                <span>Name</span>
                <span>Role</span>
                <span>Resumes</span>
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
                      className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-3 px-4 py-3 items-center cursor-pointer hover:bg-[#f5f5f7] transition-colors duration-150 group"
                    >
                      {/* Name & Email */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] font-bold text-[11px] shrink-0">
                          {fullName(user).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1d1d1f] truncate group-hover:text-[#0066cc] transition-colors">
                            {fullName(user)}
                          </p>
                          <p className="text-[10px] text-[#6e6e73] truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Role badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold w-fit ${
                        user.role === 'admin'
                          ? 'bg-[#bf5af2]/10 text-[#9b40cc] border border-[#bf5af2]/20'
                          : user.role === 'recruiter'
                          ? 'bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20'
                          : 'bg-[#34c759]/10 text-[#248a3d] border border-[#34c759]/20'
                      }`}>
                        {user.role}
                      </span>

                      {/* Resume count & avg score */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#1d1d1f]">{resumeCount}</span>
                        {avgUserScore !== null && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${scoreBadge(avgUserScore)}`}>
                            {avgUserScore}%
                          </span>
                        )}
                      </div>

                      {/* Joined */}
                      <span className={`${mutedText} text-[10px]`}>
                        {safeDate(user.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Recent Users Section */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0066cc] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>👥</span> Recent Users
            </h3>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-xs text-[#a1a1a6] text-center py-4">No recent users.</p>
            ) : (
              <div className="space-y-2.5">
                {recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-[#f5f5f7] rounded-xl hover:bg-[#ebebef] transition-colors duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] font-bold text-xs shrink-0">
                        {fullName(u).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1d1d1f] truncate">{fullName(u)}</p>
                        <p className="text-[10px] text-[#6e6e73] truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-[#bf5af2]/10 text-[#9b40cc]' :
                        u.role === 'recruiter' ? 'bg-[#0066cc]/10 text-[#0066cc]' :
                        'bg-[#34c759]/10 text-[#248a3d]'
                      }`}>
                        {u.role}
                      </span>
                      <p className="text-[9px] text-[#a1a1a6] mt-0.5">{safeDate(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Uploads Section */}
          <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#248a3d] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileTextIcon size={16} className="inline" /> Recent Uploads
            </h3>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
              </div>
            ) : recentUploads.length === 0 ? (
              <p className="text-xs text-[#a1a1a6] text-center py-4">No recent uploads.</p>
            ) : (
              <div className="space-y-2.5">
                {recentUploads.map((r) => {
                  const studentName = r.userId ? fullName(r.userId) : 'Unknown';
                  return (
                    <div
                      key={r._id}
                      onClick={() => navigate(`/resume/${r._id}`)}
                      className="flex items-center justify-between p-3 bg-[#f5f5f7] hover:bg-[#ebebef] rounded-xl cursor-pointer transition-colors duration-150 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#1d1d1f] truncate group-hover:text-[#0066cc] transition-colors">
                            {studentName}
                          </p>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${scoreBadge(r.atsScore)}`}>
                            {r.atsScore}%
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6e6e73] truncate mt-0.5">
                          {r.roleName ? `${r.company ? r.company + ' · ' : ''}${r.roleName}` : 'General Analysis'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-[#a1a1a6]">{safeDate(r.createdAt)}</span>
                        <span className="text-[#0066cc] text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-1.5">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>

    </div>
  );
}


/** Shared inline SVG icons — consistent stroke style across the app */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Icon({ children, size = 16, className = '', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p) => <Icon {...p}><path {...base} d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path {...base} d="M9 21V12h6v9"/></Icon>;
export const ZapIcon = (p) => <Icon {...p}><polygon {...base} strokeWidth="2.5" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
export const FolderIcon = (p) => <Icon {...p}><path {...base} d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></Icon>;
export const SparklesIcon = (p) => <Icon {...p}><path {...base} d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></Icon>;
export const FileTextIcon = (p) => <Icon {...p}><path {...base} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline {...base} points="14 2 14 8 20 8"/><line {...base} x1="16" y1="13" x2="8" y2="13"/><line {...base} x1="16" y1="17" x2="8" y2="17"/></Icon>;
export const TrendingUpIcon = (p) => <Icon {...p}><polyline {...base} points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline {...base} points="17 6 23 6 23 12"/></Icon>;
export const TrophyIcon = (p) => <Icon {...p}><path {...base} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path {...base} d="M7 6H4a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3M17 6h3a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3"/></Icon>;
export const TargetIcon = (p) => <Icon {...p}><circle {...base} cx="12" cy="12" r="10"/><circle {...base} cx="12" cy="12" r="6"/><circle {...base} cx="12" cy="12" r="2"/></Icon>;
export const EyeIcon = (p) => <Icon {...p}><path {...base} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...base} cx="12" cy="12" r="3"/></Icon>;
export const DownloadIcon = (p) => <Icon {...p}><path {...base} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline {...base} points="7 10 12 15 17 10"/><line {...base} x1="12" y1="15" x2="12" y2="3"/></Icon>;
export const TrashIcon = (p) => <Icon {...p}><polyline {...base} points="3 6 5 6 21 6"/><path {...base} d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path {...base} d="M10 11v6M14 11v6"/><path {...base} d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Icon>;
export const UserIcon = (p) => <Icon {...p}><path {...base} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle {...base} cx="12" cy="7" r="4"/></Icon>;
export const PenLineIcon = (p) => <Icon {...p}><path {...base} d="M12 20h9"/><path {...base} d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Icon>;
export const CodeIcon = (p) => <Icon {...p}><polyline {...base} points="16 18 22 12 16 6"/><polyline {...base} points="8 6 2 12 8 18"/></Icon>;
export const BuildingIcon = (p) => <Icon {...p}><rect {...base} x="4" y="2" width="16" height="20" rx="2"/><path {...base} d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></Icon>;
export const GraduationCapIcon = (p) => <Icon {...p}><path {...base} d="M22 10l-10-5L2 10l10 5 10-5z"/><path {...base} d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></Icon>;
export const KeyIcon = (p) => <Icon {...p}><path {...base} d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></Icon>;
export const MailIcon = (p) => <Icon {...p}><path {...base} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline {...base} points="22 6 12 13 2 6"/></Icon>;
export const SearchIcon = (p) => <Icon {...p}><circle {...base} cx="11" cy="11" r="8"/><line {...base} x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
export const InboxIcon = (p) => <Icon {...p}><polyline {...base} points="22 12 16 12 14 15 10 15 8 12 2 12"/><path {...base} d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></Icon>;
export const AlertTriangleIcon = (p) => <Icon {...p}><path {...base} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line {...base} x1="12" y1="9" x2="12" y2="13"/><line {...base} x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
export const CheckCircleIcon = (p) => <Icon {...p}><path {...base} d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline {...base} points="22 4 12 14.01 9 11.01"/></Icon>;
export const XCircleIcon = (p) => <Icon {...p}><circle {...base} cx="12" cy="12" r="10"/><line {...base} x1="15" y1="9" x2="9" y2="15"/><line {...base} x1="9" y1="9" x2="15" y2="15"/></Icon>;
export const BarChartIcon = (p) => <Icon {...p}><line {...base} x1="12" y1="20" x2="12" y2="10"/><line {...base} x1="18" y1="20" x2="18" y2="4"/><line {...base} x1="6" y1="20" x2="6" y2="16"/></Icon>;
export const LightbulbIcon = (p) => <Icon {...p}><path {...base} d="M9 18h6M10 22h4"/><path {...base} d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></Icon>;
export const WrenchIcon = (p) => <Icon {...p}><path {...base} d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Icon>;
export const ClockIcon = (p) => <Icon {...p}><circle {...base} cx="12" cy="12" r="10"/><polyline {...base} points="12 6 12 12 16 14"/></Icon>;
export const FlameIcon = (p) => <Icon {...p}><path {...base} d="M8.5 14.5A2.5 2.5 0 0 0 11 17c2.5 0 3.5-2 3.5-3.5 0-2-1.5-3.5-3.5-5.5C8 10.5 6 12 6 14.5a6 6 0 1 0 12 0c0-2.5-1.5-4-3-5.5"/></Icon>;
export const CloudUploadIcon = (p) => <Icon {...p}><polyline {...base} points="16 16 12 12 8 16"/><line {...base} x1="12" y1="12" x2="12" y2="21"/><path {...base} d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></Icon>;
export const UsersIcon = (p) => <Icon {...p}><path {...base} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle {...base} cx="9" cy="7" r="4"/><path {...base} d="M23 21v-2a4 4 0 0 0-3-3.87"/><path {...base} cx="16" cy="7" r="4"/></Icon>;
export const BriefcaseIcon = (p) => <Icon {...p}><rect {...base} x="2" y="7" width="20" height="14" rx="2"/><path {...base} d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Icon>;
export const ShieldIcon = (p) => <Icon {...p}><path {...base} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
export const RefreshIcon = (p) => <Icon {...p}><polyline {...base} points="23 4 23 10 17 10"/><path {...base} d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Icon>;
export const LinkIcon = (p) => <Icon {...p}><path {...base} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path {...base} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Icon>;
export const ScissorsIcon = (p) => <Icon {...p}><circle {...base} cx="6" cy="6" r="3"/><circle {...base} cx="6" cy="18" r="3"/><line {...base} x1="20" y1="4" x2="8.12" y2="15.88"/><line {...base} x1="14.47" y1="14.48" x2="20" y2="20"/></Icon>;
export const MonitorIcon = (p) => <Icon {...p}><rect {...base} x="2" y="3" width="20" height="14" rx="2"/><line {...base} x1="8" y1="21" x2="16" y2="21"/><line {...base} x1="12" y1="17" x2="12" y2="21"/></Icon>;
export const MessageSquareIcon = (p) => <Icon {...p}><path {...base} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>;
export const LayersIcon = (p) => <Icon {...p}><polygon {...base} points="12 2 2 7 12 12 22 7 12 2"/><polyline {...base} points="2 17 12 22 22 17"/><polyline {...base} points="2 12 12 17 22 12"/></Icon>;

/** Map icon keys used in data arrays to components */
export const ICON_MAP = {
  structure: PenLineIcon,
  impact: TrendingUpIcon,
  skillAlignment: KeyIcon,
  complexity: BuildingIcon,
  professionalism: PenLineIcon,
  skillProjectFit: TargetIcon,
  file: FileTextIcon,
  sparkles: SparklesIcon,
  trophy: TrophyIcon,
  trending: TrendingUpIcon,
  target: TargetIcon,
  user: UserIcon,
  summary: PenLineIcon,
  skills: CodeIcon,
  experience: BuildingIcon,
  projects: LayersIcon,
  education: GraduationCapIcon,
};

/** Fetch LaTeX source for a tailored resume via the backend API */
export async function fetchLatexExport({ resumeId, tailoredData }) {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const apiBase = raw.replace(/\/+$/, '').replace(/\/api$/, '');
  const res = await fetch(`${apiBase}/api/resume/generate-latex`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId, tailoredData }),
  });
  if (!res.ok) throw new Error(`Failed to generate LaTeX: ${res.statusText}`);
  const { latex } = await res.json();
  return latex.replace(/^```(?:latex|tex)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

# AI Resume App — Features

This document summarizes the main features of the AI Resume App and points to key source files for each capability.

- **Resume upload & parsing**: Upload PDF resumes; backend parses content and stores resumes.
  - Key files: backend/utils/pdfParser.js, backend/models/Resume.js

- **Two analysis modes**: General ATS scan and Targeted JD match (keyword extraction, role fit score).
  - Key files: backend/services/resumeParser.js, backend/services/aiAnalyzer.js, frontend/src/components/InteractiveEditor.jsx

- **ATS scoring & diagnostics**: 0–100 ATS score, top strengths, fixable issues, AI summary.
  - Key files: backend/services/scorer.js, backend/services/resumeFormat.js

- **Tailored rewrite**: AI-driven resume rewriting using the STAR method; avoids hallucinations.
  - Key files: backend/services/aiAnalyzer.js, backend/services/mergeTailoredResume.js

- **Version history**: Saved uploads with scores; view past versions.
  - Key files: backend/models/ResumeSession.js, frontend/src/components/VersionHistory (component folder)

- **Export options**: Copy, PDF generation, Overleaf/LaTeX export.
  - Key files: backend/services/generateResumePdf.js, backend/services/compileLatex.js, frontend/utils/latexExport.js

- **Recruiter tools**: Candidate ranking by ATS score, split-screen review, objective summaries.
  - Key files: frontend/src/components/RecruiterDashboard.jsx, frontend/src/components/RecruiterResumeView.jsx

- **User flows**: Register/login, student & recruiter dashboards, profile, interactive editor, live preview.
  - Key files: frontend/src/components/Register.jsx, Login.jsx, Profile.jsx, InteractiveEditor.jsx, LiveResumePreview.jsx

- **Admin & invitations**: Admin APIs and invitation flows for team onboarding.
  - Key files: backend/apis/admin.js, backend/apis/invitations.js, backend/controller/adminController.js

- **Quality checks & utilities**: Formatting checks, deduplication, link normalization, validation, scoring helpers.
  - Key files: backend/utils/*, backend/services/scorer.js, utils/rankBullets.js

- **Uploads & storage**: Cloudinary integration and upload helpers.
  - Key files: backend/config/cloudinary.js, backend/config/cloudinaryUpload.js, backend/uploads/

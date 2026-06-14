import express from 'express';
import { verifyToken } from '../middleware/auth.js';

export const invitationsRouter = express.Router();

invitationsRouter.post('/send', verifyToken("recruiter", "admin"), async (req, res, next) => {
  try {
    const {
      recruiterName,
      recruiterEmail,
      candidateName,
      candidateEmail,
      roleName,
      companyName,
      customMessage
    } = req.body;

    if (!recruiterName || !recruiterEmail || !candidateName || !candidateEmail || !roleName || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Print mock invitation details to the node console
      console.warn('--- MOCK EMAIL INVITATION (RESEND_API_KEY is not set in backend/.env) ---');
      console.warn(`To: ${candidateName} <${candidateEmail}>`);
      console.warn(`Reply-To: ${recruiterEmail}`);
      console.warn(`Subject: Interview Invitation from ${companyName}`);
      console.warn(`Body:`);
      console.warn(`Hello ${candidateName},\n\nYou have been shortlisted for the role of ${roleName}.\n\nRecruiter:\n${recruiterName}\n\nCompany:\n${companyName}\n\nMessage:\n${customMessage}\n\nPlease reply directly to this email if interested.\n\nBest Regards,\n${recruiterName}`);
      console.warn('----------------------------------------------------------------------');
      return res.status(200).json({ message: 'Invitation processed (simulated: RESEND_API_KEY not configured)' });
    }

    // Call Resend API using global fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Acme <onboarding@resend.dev>',
        to: candidateEmail,
        reply_to: recruiterEmail,
        subject: `Interview Invitation from ${companyName}`,
        text: `Hello ${candidateName},\n\nYou have been shortlisted for the role of ${roleName}.\n\nRecruiter:\n${recruiterName}\n\nCompany:\n${companyName}\n\nMessage:\n${customMessage}\n\nPlease reply directly to this email if interested.\n\nBest Regards,\n${recruiterName}`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[Resend Error] Payload / API error details:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to dispatch email via Resend' });
    }

    console.log(`[Resend Success] Email sent successfully with ID: ${data.id}`);
    return res.status(200).json({ message: 'Invitation sent successfully!', id: data.id });
  } catch (err) {
    console.error('[Invitation Controller Error]:', err);
    next(err);
  }
});

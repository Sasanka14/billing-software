import { sendMail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();
    if (!to || !subject || (!text && !html)) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await sendMail({ to, subject, text, html });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 
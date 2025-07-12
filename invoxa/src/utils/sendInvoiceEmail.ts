import nodemailer from 'nodemailer';

export async function sendInvoiceEmail({
  to,
  subject,
  html,
  pdfBuffer,
  invoiceNumber
}: {
  to: string;
  subject: string;
  html: string;
  pdfBuffer?: Buffer;
  invoiceNumber: string;
}) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions: any = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
} 
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { sendInvoiceEmail } from '@/utils/sendInvoiceEmail';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const {
    clientName, clientEmail, items, total, discount, advanceAmount, remainingAmount, invoiceNumber
  } = await req.json();

  // Validate email
  if (!clientEmail || !/^\S+@\S+\.\S+$/.test(clientEmail)) {
    return NextResponse.json({ error: 'Invalid or missing client email address.' }, { status: 400 });
  }

  // Generate Razorpay payment link for advance
  const paymentLink = await razorpay.paymentLink.create({
    amount: Math.round(advanceAmount * 100),
    currency: 'INR',
    accept_partial: false,
    description: `Advance for Invoice #${invoiceNumber}`,
    customer: {
      name: clientName,
      email: clientEmail,
    },
    notify: {
      email: true,
      sms: false
    },
    reference_id: `invoice_${invoiceNumber}_advance`,
    callback_url: 'https://yourdomain.com/payment-success',
    callback_method: 'get'
  });

  // Compose email HTML using the provided template
  const itemsList = items.map((item: any) => `<li>${item.description}</li>`).join('');
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Advance Payment Request</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(to bottom, #f5f7fa, #e4e9f0); margin: 0; padding: 0; color: #333; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); }
      .header { text-align: center; margin-bottom: 24px; }
      .header h2 { font-size: 1.5rem; color: #2563eb; margin-bottom: 4px; }
      .header p { color: #6d28d9; font-size: 0.95rem; font-weight: 600; }
      .section { background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
      .section h3 { color: #4c1d95; font-size: 1.1rem; margin-bottom: 12px; display: flex; align-items: center; }
      .section h3 span { margin-right: 8px; font-size: 1.3rem; }
      .cta-button { display: inline-block; background: linear-gradient(to right, #8b5cf6, #6366f1); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; text-align: center; }
      ul { padding-left: 20px; margin: 8px 0; }
      .footer { font-size: 0.9rem; text-align: center; color: #666; margin-top: 32px; }
      .purple { color: #6d28d9; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Advance Payment Request for Invoice #<span style="color:#6366f1;">${invoiceNumber}</span></h2>
        <p>From <span class="purple">SasankaWrites</span></p>
      </div>
      <p>Dear <strong>${clientName}</strong>,</p>
      <p>Thank you for choosing to work with us. To initiate your project and proceed smoothly, we kindly request the advance payment as detailed below.</p>
      <div class="section">
        <h3><span>🧾</span>Invoice Summary</h3>
        <p><strong>Items/Services Ordered:</strong></p>
        <ul>${itemsList}</ul>
        <p><strong>Total Amount:</strong> ₹${total}</p>
        <p><strong>Discount Applied:</strong> ${discount}%</p>
        <p><strong>Advance Required:</strong> ₹${advanceAmount}</p>
        <p><strong>Balance After Advance:</strong> ₹${remainingAmount}</p>
      </div>
      <div class="section">
        <h3><span>💳</span>Payment</h3>
        <p>Please click the button below to securely complete your advance payment:</p>
        <a href="${paymentLink.short_url}" class="cta-button">Pay Advance Now</a>
      </div>
      <div class="section">
        <h3><span>📩</span>Contact Info</h3>
        <p>If you have any questions, feel free to contact us via email:</p>
        <p><a href="mailto:sasankawrites14@gmail.com">sasankawrites14@gmail.com</a></p>
      </div>
      <div class="footer">
        Warm regards,<br />
        <strong>Sasanka Sekhar Kundu</strong><br />
        Team <span class="purple">SasankaWrites</span> • Company: <span class="purple">SasankaWrites</span>
      </div>
    </div>
  </body>
</html>`;

  await sendInvoiceEmail({
    to: clientEmail,
    subject: `Advance Payment Request for Invoice #${invoiceNumber}`,
    html,
    invoiceNumber,
  });

  return NextResponse.json({ success: true, paymentLink: paymentLink.short_url });
} 
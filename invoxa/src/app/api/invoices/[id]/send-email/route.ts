import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceEmailHtml } from '@/utils/generateInvoiceEmailHtml';
import { generateInvoicePdfHtml } from '@/utils/generateInvoicePdfHtml';
import { generateInvoicePdfBuffer } from '@/utils/generateInvoicePdfBuffer';
import { sendInvoiceEmail } from '@/utils/sendInvoiceEmail';

// Add the payment link email HTML generator
function generatePaymentLinkEmailHtml({
  invoiceNumber,
  clientName,
  clientEmail,
  clientCompany,
  clientAddress,
  clientPhone,
  items,
  currency,
  total,
  dueDate,
  paymentUrl,
  paymentTerms
}: {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientAddress?: string;
  clientPhone?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; }>;
  currency: string;
  total: number;
  dueDate: string;
  paymentUrl: string;
  paymentTerms: string;
}) {
  return `
  <div style="background: #f4f4f8; padding: 0; margin: 0; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f8; padding: 0; margin: 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #0001; margin: 32px 0; overflow: hidden;">
            <tr>
              <td style="background: linear-gradient(90deg, #A855F7 0%, #6366F1 100%); padding: 32px 24px 24px 24px; border-radius: 18px 18px 0 0;">
                <span style="font-size: 2.2rem; font-weight: bold; color: #fff; letter-spacing: 2px;">SasankaWrites</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 0 32px;">
                <h2 style="color: #A855F7; margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700;">
                  Payment Link for Invoice <span style="color: #6366F1;">#${invoiceNumber}</span>
                </h2>
                <h3 style="color: #A855F7; margin: 24px 0 12px 0; font-size: 1.1rem;">Payment Link</h3>
                <p style="color: #222; margin: 0 0 24px 0; font-size: 1.05rem;">
                  Dear <b>${clientName}</b>,<br>
                  You can now pay your invoice using the secure payment link below:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8ff; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 2px 8px #a855f71a;">
                  <tr>
                    <td style="padding: 28px;">
                      <h4 style="color: #6366F1; margin: 0 0 16px 0; font-size: 1.08rem;">Client Information</h4>
                      <p style="margin: 0 0 6px 0;"><b>Name:</b> ${clientName}</p>
                      <p style="margin: 0 0 6px 0;"><b>Email:</b> ${clientEmail}</p>
                      ${clientCompany ? `<p style='margin:0 0 6px 0;'><b>Company:</b> ${clientCompany}</p>` : ''}
                      ${clientAddress ? `<p style='margin:0 0 6px 0;'><b>Address:</b> ${clientAddress}</p>` : ''}
                      ${clientPhone ? `<p style='margin:0 0 6px 0;'><b>Phone:</b> ${clientPhone}</p>` : ''}
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8ff; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 2px 8px #a855f71a;">
                  <tr>
                    <td style="padding: 28px;">
                      <h4 style="color: #6366F1; margin: 0 0 16px 0; font-size: 1.08rem;">Items</h4>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 0.97rem;">
                        <thead>
                          <tr style="background: #ede9fe;">
                            <th align="left" style="padding: 8px;">Description</th>
                            <th align="right" style="padding: 8px;">Qty</th>
                            <th align="right" style="padding: 8px;">Unit Price</th>
                            <th align="right" style="padding: 8px;">Discount</th>
                            <th align="right" style="padding: 8px;">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${items.map(item => `
                            <tr>
                              <td style="padding: 8px;">${item.description}</td>
                              <td align="right" style="padding: 8px;">${item.quantity}</td>
                              <td align="right" style="padding: 8px;">${currency} ${item.unitPrice.toFixed(2)}</td>
                              <td align="right" style="padding: 8px;">${item.discount}%</td>
                              <td align="right" style="padding: 8px;">${currency} ${(item.unitPrice * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f8ff; border-radius: 16px; margin-bottom: 32px; box-shadow: 0 2px 8px #a855f71a;">
                  <tr>
                    <td style="padding: 28px;">
                      <h4 style="color: #6366F1; margin: 0 0 16px 0; font-size: 1.08rem;">Payment Summary</h4>
                      <p style="margin: 0 0 10px 0; font-size: 1.05rem;"><b>Total Amount:</b> <span style="color: #A855F7;">${currency} ${total.toFixed(2)}</span></p>
                      <p style="margin: 0 0 10px 0; font-size: 1.05rem;"><b>Due Date:</b> <span style="color: #A855F7;">${dueDate}</span></p>
                      <p style="margin: 0; font-size: 1.05rem;"><b>Payment Terms:</b> <span style="color: #A855F7;">${paymentTerms}</span></p>
                    </td>
                  </tr>
                </table>
                <div style="height: 1px; background: #ede9fe; margin: 32px 0 24px 0;"></div>
                <div style="text-align: center; margin-bottom: 40px;">
                  <a href="${paymentUrl}" style="background: linear-gradient(90deg, #A855F7 0%, #6366F1 100%); color: #fff; padding: 18px 60px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 1.15rem; display: inline-block; box-shadow: 0 4px 16px #a855f733; letter-spacing: 1px; transition: background 0.2s;">Pay Now</a>
                </div>
                <p style="color: #555; font-size: 0.97rem; margin-bottom: 0;">
                  This payment link is secure and will expire in 2 hours.
                </p>
                <p style="color: #555; font-size: 0.97rem; margin-bottom: 0;">
                  If you have any questions, please don't hesitate to contact us.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background: #ede9fe; text-align: center; padding: 18px 0; border-top: 1px solid #eee; border-radius: 0 0 18px 18px;">
                <span style="color: #6366F1; font-weight: 500; font-size: 1rem;">&copy; ${new Date().getFullYear()} SasankaWrites. All rights reserved.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// Define PopulatedInvoice type (should match utils)
type PopulatedInvoice = {
  invoiceNumber: string;
  client: {
    name: string;
    email: string;
    company?: string;
    address?: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  currency: string;
  total: number;
  advanceAmount: number;
  paymentTerms: string;
};

export async function POST(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const { params } = context;
    const { type } = await req.json();
    const invoice = await Invoice.findOne({
      _id: params.id
    }).populate('client', 'name email company address phone') as PopulatedInvoice | null;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let subject = '';
    let htmlContent = '';
    let pdfBuffer: Buffer | undefined = undefined;

    if (type === 'invoice') {
      subject = `Invoice #${invoice.invoiceNumber} from SasankaWrites`;
      htmlContent = generateInvoiceEmailHtml(invoice);
      const pdfHtml = generateInvoicePdfHtml(invoice);
      const rawPdfBuffer = await generateInvoicePdfBuffer(pdfHtml);
      pdfBuffer = Buffer.isBuffer(rawPdfBuffer) ? rawPdfBuffer : Buffer.from(rawPdfBuffer);
    } else if (type === 'payment') {
      subject = `Payment Link for Invoice #${invoice.invoiceNumber}`;
      htmlContent = generatePaymentLinkEmailHtml({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        clientCompany: invoice.client.company,
        clientAddress: invoice.client.address,
        clientPhone: invoice.client.phone,
        items: invoice.items,
        currency: invoice.currency,
        total: invoice.total,
        dueDate: new Date((invoice as any).dueDate).toLocaleDateString(),
        paymentUrl: 'https://your-payment-link.com', // TODO: Replace with real payment URL
        paymentTerms: invoice.paymentTerms || 'Net 30',
      });
      pdfBuffer = undefined;
    }

    await sendInvoiceEmail({
      to: invoice.client.email,
      subject,
      html: htmlContent,
      pdfBuffer,
      invoiceNumber: invoice.invoiceNumber,
    });

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${invoice.client.email}`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 
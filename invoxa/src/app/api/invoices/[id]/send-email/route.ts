import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceEmailHtml } from '@/utils/generateInvoiceEmailHtml';
import { generateInvoicePdfHtml } from '@/utils/generateInvoicePdfHtml';
import { generateInvoicePdfBuffer } from '@/utils/generateInvoicePdfBuffer';
import { sendInvoiceEmail } from '@/utils/sendInvoiceEmail';

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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const id = req.nextUrl.pathname.split('/').pop();
    const { type } = await req.json();
    const invoice = await Invoice.findOne({
      _id: id
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
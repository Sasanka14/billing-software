import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import { verifyJwt } from '@/lib/auth';
import { generateInvoicePdfHtml } from '@/utils/generateInvoicePdfHtml';
import { generateInvoicePdfBuffer } from '@/utils/generateInvoicePdfBuffer';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    // Extract id from the URL
    const segments = req.nextUrl.pathname.split('/');
    const id = segments[segments.length - 2];
    const invoice = await Invoice.findOne({ _id: id })
      .populate('client', 'name email company address phone');
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    const pdfHtml = generateInvoicePdfHtml(invoice);
    const rawPdfBuffer = await generateInvoicePdfBuffer(pdfHtml);
    const pdfBuffer = Buffer.isBuffer(rawPdfBuffer) ? rawPdfBuffer : Buffer.from(rawPdfBuffer);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
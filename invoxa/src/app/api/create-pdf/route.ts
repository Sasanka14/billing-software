import { generateInvoicePDF } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const invoice = await request.json();
    const pdfBuffer = await generateInvoicePDF(invoice);
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="invoice.pdf"',
      },
    });
  } catch (err) {
    return Response.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 
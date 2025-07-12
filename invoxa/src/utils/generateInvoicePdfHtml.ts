// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PopulatedInvoice = any;

export function generateInvoicePdfHtml(invoice: PopulatedInvoice) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice #${invoice.invoiceNumber}</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f4f4f8;
            color: #1f2937;
            line-height: 1.5;
            padding: 20px;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
            overflow: hidden;
          }

          .header {
            background: linear-gradient(90deg, #a855f7, #6366f1);
            padding: 24px 32px;
            color: white;
          }

          .brand {
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .content {
            padding: 32px;
          }

          .section {
            margin-bottom: 28px;
          }

          h2 {
            color: #4f46e5;
            font-size: 1.5rem;
            margin-bottom: 8px;
          }

          h3 {
            font-size: 1.2rem;
            color: #7c3aed;
            margin-bottom: 12px;
          }

          .section-inner {
            background: #f9fafb;
            padding: 20px;
            border-radius: 10px;
          }

          .info p {
            margin-bottom: 6px;
            font-size: 0.95rem;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          table th,
          table td {
            text-align: left;
            padding: 10px 8px;
          }

          table th {
            background-color: #ede9fe;
            font-size: 0.9rem;
          }

          table td {
            background-color: #fff;
            font-size: 0.92rem;
          }

          .text-right {
            text-align: right;
          }

          .summary p {
            font-size: 0.95rem;
            margin-bottom: 8px;
          }

          .footer {
            background: #ede9fe;
            text-align: center;
            padding: 18px;
            font-size: 0.95rem;
            color: #6b21a8;
            font-weight: 500;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">SasankaWrites</div>
          </div>

          <div class="content">
            <h2>Invoice #${invoice.invoiceNumber}</h2>
            <p style="margin-bottom: 24px;">Hello <strong>${invoice.client.name}</strong>,<br/>Please find your invoice details below.</p>

            <div class="section">
              <h3>Client Details</h3>
              <div class="section-inner info">
                <p><strong>Name:</strong> ${invoice.client.name}</p>
                <p><strong>Email:</strong> ${invoice.client.email}</p>
                ${invoice.client.company ? `<p><strong>Company:</strong> ${invoice.client.company}</p>` : ''}
                ${invoice.client.address ? `<p><strong>Address:</strong> ${invoice.client.address}</p>` : ''}
                ${invoice.client.phone ? `<p><strong>Phone:</strong> ${invoice.client.phone}</p>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>Items</h3>
              <div class="section-inner">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th class="text-right">Qty</th>
                      <th class="text-right">Unit Price</th>
                      <th class="text-right">Discount</th>
                      <th class="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoice.items
                      .map(
                        (item: any) => `
                      <tr>
                        <td>${item.description}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
                        <td class="text-right">${item.discount}%</td>
                        <td class="text-right">${invoice.currency} ${(item.unitPrice * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="section">
              <h3>Payment Summary</h3>
              <div class="section-inner summary">
                <p><strong>Total:</strong> ${invoice.currency} ${invoice.total.toFixed(2)}</p>
                ${
                  invoice.advanceAmount > 0
                    ? `<p><strong>Advance Paid:</strong> ${invoice.currency} ${invoice.advanceAmount.toFixed(2)}</p>`
                    : ''
                }
                <p><strong>Payment Terms:</strong> ${invoice.paymentTerms || 'Net 30'}</p>
              </div>
            </div>

            <p style="font-size: 0.93rem; color: #374151;">For any queries, feel free to reach out to us.</p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} SasankaWrites. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

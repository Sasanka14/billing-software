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

export function generateInvoiceEmailHtml(invoice: PopulatedInvoice) {
  return `
  <div style="background: #f4f4f8; padding: 0; margin: 0; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f8; padding: 0; margin: 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #0001; margin: 32px 0; overflow: hidden;">
            <tr>
              <td style="background: linear-gradient(90deg, #A855F7 0%, #6366F1 100%); padding: 32px 24px 24px 24px; border-radius: 18px 18px 0 0;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 2.2rem; font-weight: bold; color: #fff; letter-spacing: 2px;">SasankaWrites</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 0 32px;">
                <h2 style="color: #A855F7; margin: 0 0 8px 0; font-size: 1.5rem; font-weight: 700;">
                  Invoice <span style="color: #6366F1;">#${invoice.invoiceNumber}</span>
                </h2>
                <p style="color: #222; margin: 0 0 24px 0; font-size: 1.05rem;">
                  Dear <b>${invoice.client.name}</b>,<br>
                  Please find attached your invoice for the services provided.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; border-radius: 12px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <h3 style="color: #6366F1; margin: 0 0 12px 0; font-size: 1.1rem;">Client Information</h3>
                      <p style="margin: 0 0 6px 0;"><b>Name:</b> ${invoice.client.name}</p>
                      <p style="margin: 0 0 6px 0;"><b>Email:</b> ${invoice.client.email}</p>
                      ${invoice.client.company ? `<p style='margin:0 0 6px 0;'><b>Company:</b> ${invoice.client.company}</p>` : ''}
                      ${invoice.client.address ? `<p style='margin:0 0 6px 0;'><b>Address:</b> ${invoice.client.address}</p>` : ''}
                      ${invoice.client.phone ? `<p style='margin:0 0 6px 0;'><b>Phone:</b> ${invoice.client.phone}</p>` : ''}
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; border-radius: 12px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <h3 style="color: #6366F1; margin: 0 0 12px 0; font-size: 1.1rem;">Items</h3>
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
                          ${invoice.items.map(item => `
                            <tr>
                              <td style="padding: 8px;">${item.description}</td>
                              <td align="right" style="padding: 8px;">${item.quantity}</td>
                              <td align="right" style="padding: 8px;">${invoice.currency} ${item.unitPrice.toFixed(2)}</td>
                              <td align="right" style="padding: 8px;">${item.discount}%</td>
                              <td align="right" style="padding: 8px;">${invoice.currency} ${(item.unitPrice * item.quantity * (1 - item.discount / 100)).toFixed(2)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; border-radius: 12px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 24px;">
                      <h3 style="color: #6366F1; margin: 0 0 12px 0; font-size: 1.1rem;">Payment Summary</h3>
                      <p style="margin: 0 0 8px 0;"><b>Total Amount:</b> ${invoice.currency} ${invoice.total.toFixed(2)}</p>
                      ${invoice.advanceAmount > 0 ? `<p style='margin:0 0 8px 0;'><b>Advance Paid:</b> ${invoice.currency} ${invoice.advanceAmount.toFixed(2)}</p>` : ''}
                      <p style="margin: 0;"><b>Payment Terms:</b> ${invoice.paymentTerms || 'Net 30'}</p>
                    </td>
                  </tr>
                </table>
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
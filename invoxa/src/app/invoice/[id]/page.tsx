"use client";
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

interface InvoiceItem {
  description: string;
  price: string;
  qty: number;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/invoices`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((inv: any) => inv._id === id);
        setInvoice(found);
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setPdfLoading(true);
    setSuccess('');
    try {
      const res = await fetch('/api/create-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('PDF downloaded!');
    } catch {
      setError('Failed to download PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    setEmailLoading(true);
    setSuccess('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.clientEmail,
          subject: `Invoice from Invoxa` ,
          text: `Dear ${invoice.client},\nPlease find your invoice attached.`,
          html: `<h2>Invoice</h2><pre>${JSON.stringify(invoice, null, 2)}</pre>`
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      setSuccess('Email sent!');
    } catch {
      setError('Failed to send email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePaymentLink = async () => {
    if (!invoice) return;
    setPaymentLoading(true);
    setSuccess('');
    setPaymentLink('');
    try {
      const res = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (!res.ok) throw new Error('Failed to create payment link');
      const data = await res.json();
      setPaymentLink(data.url);
      setSuccess('Payment link generated!');
    } catch {
      setError('Failed to generate payment link');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading...</div>;
  if (error || !invoice) return <div className="text-center text-red-400 py-12">{error || 'Invoice not found.'}</div>;

  // Generate mailto link for invoice
  const mailtoLink = `mailto:${encodeURIComponent(invoice.clientEmail)}?subject=${encodeURIComponent('Invoice from Invoxa')}` +
    `&body=${encodeURIComponent(
      `Dear ${invoice.client},\n\n` +
      `Please find your invoice details below.\n\n` +
      `Amount: ${invoice.currency} ${invoice.amount?.toFixed(2)}\n` +
      `Discount: ${invoice.discount}%\n` +
      `Total: ${invoice.currency} ${invoice.total?.toFixed(2)}\n` +
      `Due Date: ${invoice.dueDate}\n` +
      `Notes: ${invoice.notes || ''}\n\n` +
      `Thank you for your business!`
    )}`;

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-950 py-10">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Invoice Details</h1>
          <Link href={`/invoice/${id}/edit`}>
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition">Edit</button>
          </Link>
        </div>
        {/* Client & Invoice Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="text-gray-400 text-sm mb-1">Client</div>
            <div className="font-semibold text-lg text-white">{invoice.client}</div>
            <div className="text-gray-400 text-sm mt-4 mb-1">Contact</div>
            <div className="text-white">{invoice.contact}</div>
            <div className="text-gray-400 text-sm mt-4 mb-1">Due Date</div>
            <div className="text-white">{invoice.dueDate}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Client Email</div>
            <div className="font-semibold text-lg text-white">{invoice.clientEmail}</div>
            <div className="text-gray-400 text-sm mt-4 mb-1">Address</div>
            <div className="text-white">{invoice.address}</div>
            <div className="text-gray-400 text-sm mt-4 mb-1">Currency</div>
            <div className="text-white">{invoice.currency}</div>
          </div>
        </div>
        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Items</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && (invoice.items as InvoiceItem[]).map((item: InvoiceItem, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}>
                    <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-2 text-white">{item.description}</td>
                    <td className="px-4 py-2 text-right text-gray-200">{invoice.currency} {parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-gray-200">{item.qty}</td>
                    <td className="px-4 py-2 text-right text-white font-semibold">{invoice.currency} {(parseFloat(item.price) * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 min-w-[220px]">
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Subtotal:</span>
              <span>{invoice.currency} {invoice.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Discount:</span>
              <span>{invoice.discount}%</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span className="text-white">Total:</span>
              <span className="text-green-400">{invoice.currency} {invoice.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Status & Notes */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'Paid' ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>
              {invoice.status || 'Pending'}
            </span>
          </div>
          {invoice.notes && (
            <div className="italic text-gray-400 bg-gray-800 rounded-lg px-4 py-2 max-w-md w-full text-center">
              {invoice.notes}
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button onClick={handleDownloadPDF} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>Download PDF</span>
          </button>
          <button onClick={handleSendEmail} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>Send Email</span>
          </button>
          <button onClick={handlePaymentLink} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>Payment Link</span>
          </button>
        </div>
        {/* Success/Error Messages */}
        {success && <div className="text-green-400 text-center mt-4">{success}</div>}
        {error && <div className="text-red-400 text-center mt-4">{error}</div>}
      </div>
    </div>
  );
} 
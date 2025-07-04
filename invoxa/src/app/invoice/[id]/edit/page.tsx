'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface InvoiceItem {
  description: string;
  price: string;
  qty: number;
}

export default function EditInvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((inv: any) => inv._id === id);
        setForm(found);
      })
      .catch(() => setError('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...form.items];
    newItems[idx][field] = field === 'qty' ? parseInt(value as string) : value as any;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', price: '', qty: 1 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_: InvoiceItem, i: number) => i !== idx) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), discount: parseFloat(form.discount) }),
      });
      if (!res.ok) throw new Error('Failed to update invoice');
      setSuccess('Invoice updated!');
      setTimeout(() => window.location.href = `/invoice/${form._id}`, 1000);
    } catch (err) {
      setError('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-12">Loading...</div>;
  if (error || !form) return <div className="text-center text-red-400 py-12">{error || 'Invoice not found.'}</div>;

  // Calculate subtotal from items
  const subtotal = form.items.reduce((sum: number, item: InvoiceItem) => sum + (parseFloat(item.price) || 0) * (item.qty || 1), 0);
  const discountValue = subtotal * ((parseFloat(form.discount) || 0) / 100);
  const total = Math.max(0, subtotal - discountValue);

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl max-w-xl mx-auto space-y-6 border border-gray-800 mt-8">
      <h2 className="text-2xl font-extrabold text-primary mb-2 text-center">Edit Invoice</h2>
      {error && <div className="text-red-400 text-center">{error}</div>}
      {success && <div className="text-green-400 text-center">{success}</div>}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Client Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">Client Name *</label>
            <input name="client" value={form.client} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block mb-1 text-sm">Client Email *</label>
            <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block mb-1 text-sm">Contact</label>
            <input name="contact" value={form.contact} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1 text-sm">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-4">Invoice Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">Due Date *</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block mb-1 text-sm">Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary">
              {['INR', 'USD', 'EUR', 'GBP'].map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Amount *</label>
            <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required min="0" step="0.01" />
          </div>
          <div>
            <label className="block mb-1 text-sm">Discount (%)</label>
            <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" min="0" max="100" step="0.01" placeholder="e.g. 10 for 10%" />
          </div>
        </div>
        <div className="col-span-1 sm:col-span-2 flex items-center justify-between mt-2">
          <span className="font-semibold text-gray-300">Total Amount:</span>
          <span className="text-lg font-bold text-green-400">{form.currency} {total.toFixed(2)}</span>
        </div>
        <div className="mt-4">
          <label className="block mb-1 text-sm">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-4">Invoice Items</h3>
        <div className="space-y-2">
          {form.items.map((item: InvoiceItem, idx: number) => (
            <div key={idx} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block mb-1 text-sm">Description</label>
                <input name="description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="w-24">
                <label className="block mb-1 text-sm">Price</label>
                <input type="number" name="price" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required min="0" step="0.01" />
              </div>
              <div className="w-16">
                <label className="block mb-1 text-sm">Qty</label>
                <input type="number" name="qty" value={item.qty} onChange={e => handleItemChange(idx, 'qty', e.target.value)} className="w-full p-2 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-primary" required min="1" step="1" />
              </div>
              <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-xl font-bold pb-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="mt-2 px-4 py-1 rounded bg-primary text-white hover:bg-primary-dark font-semibold">+ Add Item</button>
        </div>
      </div>
      <div className="col-span-1 sm:col-span-2 flex items-center justify-between mt-2">
        <span className="font-semibold text-gray-300">Subtotal:</span>
        <span className="text-lg font-bold">{form.currency} {subtotal.toFixed(2)}</span>
      </div>
      <div className="col-span-1 sm:col-span-2 flex items-center justify-between mt-2">
        <span className="font-semibold text-gray-300">Discount:</span>
        <span className="text-lg font-bold">{form.discount}%</span>
      </div>
      <div className="col-span-1 sm:col-span-2 flex items-center justify-between mt-2">
        <span className="font-semibold text-gray-300">Total Amount:</span>
        <span className="text-lg font-bold text-green-400">{form.currency} {total.toFixed(2)}</span>
      </div>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-150 text-lg font-semibold mt-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
} 
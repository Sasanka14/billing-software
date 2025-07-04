import InvoiceForm from '@/components/forms/InvoiceForm';

export default function CreateInvoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30 py-8 px-2">
      <div className="w-full max-w-xl">
        <InvoiceForm />
      </div>
    </div>
  );
} 
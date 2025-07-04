import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-800 p-6 flex flex-col gap-4">
      <div className="text-2xl font-bold text-primary mb-8">Invoxa</div>
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
        <Link href="/create" className="hover:text-primary">Create Invoice</Link>
        <Link href="/clients" className="hover:text-primary">Clients</Link>
        <Link href="/settings" className="hover:text-primary">Settings</Link>
      </nav>
    </aside>
  );
} 
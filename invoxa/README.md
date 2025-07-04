# Invoxa

A private, web-based billing system built with Next.js (App Router), TailwindCSS, and TypeScript.

## Features
- Manual invoice creation (client info, notes, due date, multi-currency)
- Discount support (no GST for now)
- Download invoices as PDF
- Send invoices via email (Nodemailer)
- Payment links: Razorpay (India), Stripe (international), UPI QR
- Track invoice status (paid/pending/overdue)
- Invoice history with search/filter
- Export invoice as PDF or all as CSV
- Recurring invoices/reminders
- 1–3 user access with secure login
- Responsive, mobile-friendly, dark theme (purple-gray)

## Stack
- **Frontend:** Next.js (App Router), TailwindCSS, TypeScript
- **Backend:** Next.js API Routes
- **DB:** MongoDB Atlas
- **Auth:** JWT or session
- **Email:** Nodemailer (Gmail SMTP)
- **PDF:** html2pdf.js or Puppeteer
- **Payment:** Razorpay, Stripe
- **Hosting:** Vercel, MongoDB Atlas

## Structure
```
Invoxa/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── create/
│   │   ├── invoice/[id]/
│   │   ├── clients/
│   │   ├── settings/
│   │   └── api/
│   │       ├── invoices/
│   │       ├── send-email/
│   │       ├── create-pdf/
│   │       ├── payments/
│   │       │   ├── razorpay/
│   │       │   └── stripe/
│   │       └── webhooks/
│   ├── components/
│   │   ├── forms/
│   │   ├── invoice/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   └── shared/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── email.ts
│   │   ├── pdf.ts
│   │   ├── payments.ts
│   │   └── auth.ts
│   ├── data/
│   │   └── seed.json
│   └── styles/
│       └── globals.css
├── public/
│   └── logo.png
├── .env.local
├── tailwind.config.ts
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

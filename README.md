
# 💼 Invoxa – Smart Billing & Invoicing Platform

Invoxa is a modern, secure, and beautifully designed billing & invoicing web application. It empowers freelancers, startups, and small teams to manage clients, send professional invoices, and handle payments—**all in one place**.

---

## ✨ Features

- 🔐 **User Authentication**
  - Login with admin approval only (registration disabled)
- 👥 **Client Management**
  - Add, update, delete, and search clients
- 🧾 **Invoice Management**
  - Create, view, and delete invoices
  - Supports both advance and full payments
  - Auto-generated unique invoice numbers
  - Generate PDF using Puppeteer
  - Send branded invoice emails
- 💸 **Payment Integration**
  - Send Razorpay payment links (advance or full)
  - Handle status with webhook updates
- 📱 **Responsive UI**
  - Optimized for desktop, tablet, and mobile
  - Sidebar navigation with mobile drawer
- 🧩 **Filtering & Pagination**
  - Filter invoices by status or client
  - Paginated invoice and client lists
- 🔒 **Admin-Only Registration**
  - Controlled access; secure backend

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB (Mongoose)
- **Payments:** Razorpay
- **PDF Generator:** Puppeteer
- **Email Sender:** Nodemailer

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/invoxa.git
cd invoxa
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Configure Environment

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 4️⃣ Run the App

```bash
npm run dev
# or
yarn dev
```

🔗 Access: [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

- 🔐 **Login:** Use admin credentials only (admin-managed users)
- 👤 **Clients:** Add, manage, and search clients
- 📤 **Invoices:** Send, delete, and track payment status
- 💳 **Payments:** Generate payment links (Razorpay) for full or advance payments
- 📲 **Mobile Support:** Clean navigation and mobile-optimized layout

---

## 🔐 Security & Best Practices

- Full authentication checks before sensitive actions
- Registration disabled – access controlled by admin
- Robust error handling for cleaner UX

---

## 🖼 Screenshots (Optional)

| Dashboard | Invoice View | Email Template |
|----------|--------------|----------------|
| ![Dashboard](https://yourdomain.com/invoxa-dashboard.png) | ![Invoice](https://yourdomain.com/invoxa-invoice.png) | ![Email](https://yourdomain.com/invoxa-email.png) |

---

## 📬 Contact

For access, feature requests, or support:

📧 **sasankawrites14@gmail.com**

---

## 🧑‍💻 Credits

Designed & Developed by  
**Sasanka Sekhar Kundu**  
🛠 Team SasankaWrites




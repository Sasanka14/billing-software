import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface IInvoice extends Document {
  client: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  total: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  createdBy: Types.ObjectId;
  userId: Types.ObjectId;
  // Additional fields for advance payment
  advanceAmount: number;
  advancePaid: boolean;
  currency: string;
  paymentTerms: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    items: { type: [InvoiceItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    balance: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
    dueDate: { type: Date, required: true },
    issuedDate: { type: Date, required: true },
    paidDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Additional fields for advance payment
    advanceAmount: { type: Number, default: 0 },
    advancePaid: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },
    paymentTerms: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default (mongoose.models.Invoice as Model<IInvoice>) || mongoose.model<IInvoice>('Invoice', InvoiceSchema); 
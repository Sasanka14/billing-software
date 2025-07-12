import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String },
    address: { type: String },
    phone: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default (mongoose.models.Client as Model<IClient>) || mongoose.model<IClient>('Client', ClientSchema); 
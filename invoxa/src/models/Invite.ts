import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInvite extends Document {
  email: string;
  token: string;
  role: 'admin' | 'team';
  invitedBy: Types.ObjectId;
  accepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema: Schema<IInvite> = new Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true },
    role: { type: String, enum: ['admin', 'team'], default: 'team' },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (mongoose.models.Invite as Model<IInvite>) || mongoose.model<IInvite>('Invite', InviteSchema); 
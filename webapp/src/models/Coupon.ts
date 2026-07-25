import mongoose, { Schema, model, models } from 'mongoose';
const schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value: { type: Number, required: true },
  minAmount: { type: Number, default: 0 }, maxDiscount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 0 }, usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default models.Coupon || model('Coupon', schema);

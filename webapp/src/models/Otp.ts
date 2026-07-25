import mongoose, { Schema, model, models } from 'mongoose';
// کد یکبارمصرف ورود — کد به‌صورت هش‌شده ذخیره می‌شود و بعد از انقضا خودکار حذف می‌گردد
const schema = new Schema({
  phone: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
// حذف خودکار پس از انقضا (TTL index)
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default models.Otp || model('Otp', schema);

import mongoose, { Schema, model, models } from 'mongoose';
const schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  isApproved: { type: Boolean, default: true },
  isVerifiedBuyer: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ product: 1, user: 1 }, { unique: true });
export default models.Review || model('Review', schema);

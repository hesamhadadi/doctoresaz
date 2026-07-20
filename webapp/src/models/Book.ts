import mongoose, { Schema, model, models } from 'mongoose';
const schema = new Schema({
  instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  author: { type: String, default: '' },
  price: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
schema.index({ instrument: 1, slug: 1 }, { unique: true });
export default models.Book || model('Book', schema);

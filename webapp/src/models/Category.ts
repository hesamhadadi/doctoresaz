import mongoose, { Schema, model, models } from 'mongoose';
const schema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });
export default models.Category || model('Category', schema);

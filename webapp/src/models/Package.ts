import mongoose, { Schema, model, models } from 'mongoose';
const schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  scope: { type: String, enum: ['instrument', 'book'], default: 'instrument' },
  instrument: { type: Schema.Types.ObjectId, ref: 'Instrument' },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  price: { type: Number, required: true },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default models.Package || model('Package', schema);

import mongoose, { Schema, model, models } from 'mongoose';
const asset = new Schema({ url: { type: String, default: '' }, isFree: { type: Boolean, default: false } }, { _id: false });
const schema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  author: { type: String, default: '' },
  introVideo: { type: asset, default: () => ({ isFree: true }) },
  pdf: { type: asset, default: () => ({ isFree: true }) },
  lessonVideo: { type: asset, default: () => ({ isFree: false }) },
  audioGuide: { type: asset, default: () => ({ isFree: false }) },
  price: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default models.Piece || model('Piece', schema);

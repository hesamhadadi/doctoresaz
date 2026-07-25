import mongoose, { Schema, model, models } from 'mongoose';
const item = new Schema({
  kind: { type: String, enum: ['product', 'piece', 'book', 'package'], required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: Schema.Types.ObjectId, default: null },
  piece: { type: Schema.Types.ObjectId, ref: 'Piece' },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  package: { type: Schema.Types.ObjectId, ref: 'Package' },
  qty: { type: Number, default: 1, min: 1 },
}, { _id: true });
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [item], default: [] },
  couponCode: { type: String, default: '' },
}, { timestamps: true });
export default models.Cart || model('Cart', schema);

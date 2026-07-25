import mongoose, { Schema, model, models } from 'mongoose';
const orderItem = new Schema({
  kind: { type: String, enum: ['product', 'piece', 'book', 'package'], required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: Schema.Types.ObjectId, default: null }, variantName: { type: String, default: '' },
  piece: { type: Schema.Types.ObjectId, ref: 'Piece' },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  package: { type: Schema.Types.ObjectId, ref: 'Package' },
  title: { type: String, default: '' }, image: { type: String, default: '' },
  unitPrice: { type: Number, required: true }, qty: { type: Number, default: 1 }, lineTotal: { type: Number, required: true },
}, { _id: false });
const addr = new Schema({ fullName: String, phone: String, province: String, city: String, address: String, postalCode: String, note: String }, { _id: false });

export const ORDER_STATUSES = ['pending','paid','processing','shipped','delivered','cancelled','refunded'] as const;

const schema = new Schema({
  orderNumber: { type: String, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItem], default: [] },
  subtotal: { type: Number, required: true }, discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' }, shippingCost: { type: Number, default: 0 }, total: { type: Number, required: true },
  hasPhysical: { type: Boolean, default: false },
  shippingMethod: { type: String, enum: ['post', 'tipax', 'peyk', 'none'], default: 'none' },
  shippingAddress: { type: addr, default: null }, trackingCode: { type: String, default: '' },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now }, note: { type: String, default: '' }, _id: false }],
  paymentRef: { type: String, default: '' }, paidAt: { type: Date }, adminNote: { type: String, default: '' },
}, { timestamps: true });

schema.pre('save', function (next) {
  if (!this.orderNumber) {
    const d = new Date();
    const s = `${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    this.orderNumber = `DS-${s}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});
schema.index({ user: 1, createdAt: -1 });
export default models.Order || model('Order', schema);

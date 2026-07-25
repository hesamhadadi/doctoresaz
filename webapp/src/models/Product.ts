import mongoose, { Schema, model, models } from 'mongoose';
const variant = new Schema({
  name: { type: String, required: true }, sku: { type: String, default: '' },
  priceDiff: { type: Number, default: 0 }, stock: { type: Number, default: 0 }, image: { type: String, default: '' },
}, { _id: true });
const spec = new Schema({ key: { type: String, required: true }, value: { type: String, required: true } }, { _id: false });
const media = new Schema({
  url: { type: String, required: true }, type: { type: String, enum: ['image', 'video'], default: 'image' },
  poster: { type: String, default: '' }, alt: { type: String, default: '' },
}, { _id: false });

const schema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', default: null },
  brand: { type: String, default: '' }, maker: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  fallbackImage: { type: String, default: '' }, // وکتور جایگزین اگر عکس لود نشد
  gallery: { type: [media], default: [] },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  variants: { type: [variant], default: [] },
  specs: { type: [spec], default: [] },
  weightGrams: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  ratingAvg: { type: Number, default: 0 }, ratingCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 }, viewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }, isPublished: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.index({ category: 1, isPublished: 1 });
schema.virtual('discountPercent').get(function (this: any) {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});
schema.virtual('inStock').get(function (this: any) {
  if (this.variants?.length) return this.variants.some((v: any) => v.stock > 0);
  return this.stock > 0;
});
export default models.Product || model('Product', schema);

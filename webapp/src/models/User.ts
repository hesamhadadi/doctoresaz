import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new Schema({
  label: { type: String, default: 'خانه' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const progressSchema = new Schema({
  piece: { type: Schema.Types.ObjectId, ref: 'Piece', required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  instrument: { type: Schema.Types.ObjectId, ref: 'Instrument' },
  completed: { type: Boolean, default: false },
  lastSeenAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, default: '', unique: true, sparse: true },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  addresses: { type: [addressSchema], default: [] },
  wishlistProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  wishlistBooks: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  progress: { type: [progressSchema], default: [] },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (this: any, next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  next();
});
userSchema.methods.matchPassword = function (this: any, entered: string) {
  return this.password ? bcrypt.compare(entered, this.password) : Promise.resolve(false);
};

export default models.User || model('User', userSchema);

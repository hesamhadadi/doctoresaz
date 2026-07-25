import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db';
import { makeSlug } from './slug';
import User from '@/models/User';
import Instrument from '@/models/Instrument';
import Book from '@/models/Book';
import Piece from '@/models/Piece';
import Package from '@/models/Package';
import Order from '@/models/Order';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Cart from '@/models/Cart';
import Coupon from '@/models/Coupon';

const slug = (s: string, fb: string) => makeSlug(s) || fb;
const T = (n: number) => n * 1000;
const ART = (n: string) => `/instruments/${n}.svg`;
const DEMO = 'https://www.w3schools.com/html/mov_bbb.mp4';
// عکس واقعی سازها از ویکی‌مدیا (بهترین تلاش) — اگر لود نشد، خودکار به وکتور برمی‌گردد
const WIKI = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`;

async function seed() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Instrument.deleteMany({}), Book.deleteMany({}), Piece.deleteMany({}),
    Package.deleteMany({}), Order.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
    Review.deleteMany({}), Cart.deleteMany({}), Coupon.deleteMany({}),
  ]);

  const admin = await User.create({ name: 'حامد حدادی', email: 'admin@doctoresaz.ir', password: '123456', role: 'admin', phone: '09120000000', bio: 'مدرس و سازنده‌ی سازهای سنتی ایرانی.' });
  const user = await User.create({ name: 'کاربر نمونه', email: 'user@doctoresaz.ir', password: '123456', role: 'user', phone: '09121111111',
    addresses: [{ label: 'خانه', fullName: 'کاربر نمونه', phone: '09121111111', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، کوچه‌ی نمونه، پلاک ۱۲', postalCode: '1234567890', isDefault: true }] });

  const sazData = [
    { name: 'سه‌تار', art: 'setar', wiki: 'Setar2.JPG', desc: 'زهی مضرابی با چهار سیم؛ صمیمی‌ترین سازِ موسیقی ایرانی.' },
    { name: 'تار', art: 'tar', wiki: 'Tar (Iranian lute).jpg', desc: 'سلطان سازهای ایرانی؛ کاسه‌ای از چوب توت و پوست بره.' },
    { name: 'دف', art: 'daf', wiki: 'Daf 2.jpg', desc: 'ساز کوبه‌ای آیینی خانقاه‌ها؛ پرشور و معنوی.' },
    { name: 'سنتور', art: 'santur', wiki: 'Santur.jpg', desc: 'زهی چکشی با ۷۲ سیم؛ صدایی شفاف مثل قطرات باران.' },
    { name: 'هنگ‌درام', art: 'handpan', wiki: 'Hang drum.jpg', desc: 'سازی مدرن با صدایی مدیتیشن‌گونه.' },
    { name: 'کمانچه', art: 'kamancheh', wiki: 'Kamancheh 2.jpg', desc: 'زهی آرشه‌ای؛ نزدیک‌ترین صدا به آواز انسان.' },
  ];
  const inst: any = {};
  for (const [i, d] of sazData.entries()) {
    inst[d.name] = await Instrument.create({ name: d.name, slug: slug(d.name, `saz-${i}`), description: d.desc, coverImage: ART(d.art), order: i, createdBy: admin._id, introVideos: [{ title: `معرفی ${d.name}`, url: DEMO }] });
  }

  const mkCat = (name: string, icon: string, parent: any = null, order = 0, description = '') =>
    Category.create({ name, slug: slug(name, `cat-${order}-${Date.now()}`), icon, parent, order, description, image: ART(icon === 'book' ? 'book' : icon === 'tool' ? 'strings' : 'setar') });
  const catSaz = await mkCat('سازها', 'music', null, 1, 'سازهای دست‌ساز کارگاه‌های معتبر ایران');
  const catAcc = await mkCat('لوازم جانبی', 'tool', null, 2, 'هر چیزی که کنار ساز لازم دارید');
  const catBook = await mkCat('کتاب و نت', 'book', null, 3, 'کتاب‌های آموزشی و مجموعه‌های نت');
  const cats: any = {
    setar: await mkCat('سه‌تار', 'music', catSaz._id, 1), tar: await mkCat('تار', 'music', catSaz._id, 2),
    daf: await mkCat('دف', 'music', catSaz._id, 3), santoor: await mkCat('سنتور', 'music', catSaz._id, 4),
    handpan: await mkCat('هنگ‌درام', 'music', catSaz._id, 5),
    case: await mkCat('جعبه و کاور', 'tool', catAcc._id, 1), strings: await mkCat('سیم و مضراب', 'tool', catAcc._id, 2),
    tuner: await mkCat('کوک و متعلقات', 'tool', catAcc._id, 3), notes: await mkCat('کتاب آموزشی', 'book', catBook._id, 1),
  };

  const artFor = (p: any) => {
    const byInstrument: any = { 'سه‌تار': 'setar', 'تار': 'tar', 'دف': 'daf', 'سنتور': 'santur', 'هنگ‌درام': 'handpan', 'کمانچه': 'kamancheh' };
    const byCat: any = { [cats.case._id]: 'case', [cats.strings._id]: 'strings', [cats.tuner._id]: 'tuner', [cats.notes._id]: 'book' };
    if (p.art) return ART(p.art);
    if (byCat[p.cat?._id]) return ART(byCat[p.cat._id]);
    if (p.instrument && byInstrument[p.instrument.name]) return ART(byInstrument[p.instrument.name]);
    return ART('setar');
  };

  const P = [
    { title: 'سه‌تار استاد فرهادی — کاسه توت یک‌تکه', cat: cats.setar, instrument: inst['سه‌تار'], photo: WIKI('Setar2.JPG'),
      short: 'کاسه‌ی یک‌تکه از چوب توت خشک ۲۰ ساله، صفحه‌ی چنار، صدایی گرم و کشیده.', desc: 'دست‌ساز در کارگاه استاد فرهادی. کاسه از توت یک‌تکه، صفحه چنار، دسته گردوی روسی با ۲۶ پرده. صدادهی متعادل با باس عمیق.', price: T(28500), compare: T(33000), stock: 3, weight: 1400, brand: 'کارگاه فرهادی', maker: 'استاد رضا فرهادی', featured: true,
      specs: [{ key: 'جنس کاسه', value: 'توت یک‌تکه' }, { key: 'صفحه', value: 'چنار' }, { key: 'دسته', value: 'گردوی روسی' }, { key: 'پرده', value: '۲۶' }],
      variants: [{ name: 'استاندارد', priceDiff: 0, stock: 2 }, { name: 'با جعبه‌ی چوبی', priceDiff: T(2200), stock: 1 }], tags: ['سه‌تار', 'دست‌ساز'], rating: 4.9, ratingCount: 23, sold: 14 },
    { title: 'سه‌تار نیمه‌حرفه‌ای مدل شهنازی', cat: cats.setar, instrument: inst['سه‌تار'], photo: WIKI('Setar.jpg'),
      short: 'انتخاب اول هنرجویان جدی؛ کوک‌پذیری عالی با قیمت منطقی.', desc: 'کاسه توت ترکه‌ای، صفحه چنار، دسته گردو. کوک پایدار و اجرای راحت.', price: T(14800), compare: T(16500), stock: 8, weight: 1300, brand: 'کارگاه دکتر ساز',
      specs: [{ key: 'کاسه', value: 'توت ترکه‌ای' }, { key: 'مناسب', value: 'هنرجوی متوسط' }], tags: ['سه‌تار'], rating: 4.6, ratingCount: 41, sold: 63 },
    { title: 'تار استاد یحیی — کاسه توت، پوست بره', cat: cats.tar, instrument: inst['تار'], photo: WIKI('Tar (Iranian lute).jpg'),
      short: 'بازسازی مدل کلاسیک یحیی؛ صدایی پرقدرت با نفوذ بالا.', desc: 'کاسه‌ی توت و پوست بره‌ی نازک. خرک استخوانی، دسته گردو با ۲۸ پرده.', price: T(42000), compare: T(48000), stock: 2, weight: 3200, brand: 'کارگاه فرهادی', maker: 'استاد رضا فرهادی', featured: true,
      specs: [{ key: 'کاسه', value: 'توت' }, { key: 'پوست', value: 'بره' }, { key: 'خرک', value: 'استخوان' }], tags: ['تار', 'حرفه‌ای'], rating: 5, ratingCount: 11, sold: 7 },
    { title: 'دف کردستان — پوست بزغاله، حلقه‌ی گردو', cat: cats.daf, instrument: inst['دف'], photo: WIKI('Daf 2.jpg'),
      short: 'دف اصیل سنندج با ۷۲ حلقه‌ی برنجی؛ صدای باز و پرطنین.', desc: 'ساخت سنندج با پوست طبیعی بزغاله و بدنه‌ی گردو. قطر ۵۰ سانتی‌متر.', price: T(6900), compare: T(8200), stock: 12, weight: 1100, brand: 'کارگاه سنندج', featured: true,
      specs: [{ key: 'قطر', value: '۵۰ سانتی‌متر' }, { key: 'پوست', value: 'بزغاله' }], variants: [{ name: 'قطر ۵۰', priceDiff: 0, stock: 8 }, { name: 'قطر ۵۳', priceDiff: T(900), stock: 4 }], tags: ['دف'], rating: 4.8, ratingCount: 87, sold: 154 },
    { title: 'سنتور ۹ خرک — گردو، سیم آلمانی', cat: cats.santoor, instrument: inst['سنتور'], photo: WIKI('Santur.jpg'),
      short: 'کوک شور با سیم‌های وارداتی؛ صدایی شفاف و پایدار.', desc: 'بدنه‌ی گردو و صفحه‌ی توت. سیم آلمانی، همراه مضراب و جعبه.', price: T(23500), stock: 4, weight: 6500, brand: 'کارگاه دکتر ساز',
      specs: [{ key: 'خرک', value: '۹' }, { key: 'کوک', value: 'شور' }], tags: ['سنتور'], rating: 4.7, ratingCount: 19, sold: 22 },
    { title: 'هنگ‌درام D کردی — ۹ نت، فولاد نیتریده', cat: cats.handpan, instrument: inst['هنگ‌درام'], photo: WIKI('Hang drum.jpg'),
      short: 'کوک D Kurd؛ محبوب‌ترین کوک برای شروع.', desc: 'دست‌کوک با فولاد نیتریده. کوک D Kurd، قطر ۵۳. همراه کیف نرم و دستکش.', price: T(38000), compare: T(44000), stock: 5, weight: 4200, brand: 'Aura Handpan', featured: true,
      specs: [{ key: 'کوک', value: 'D Kurd' }, { key: 'نت', value: '۹' }], variants: [{ name: 'D Kurd (۹ نت)', priceDiff: 0, stock: 3 }, { name: 'C# (۱۰ نت)', priceDiff: T(4500), stock: 2 }], tags: ['هنگ‌درام'], rating: 4.9, ratingCount: 34, sold: 41 },
    { title: 'کمانچه‌ی چهارسیم — کاسه توت، پوست ماهی', cat: cats.tar, instrument: inst['کمانچه'], photo: WIKI('Kamancheh 2.jpg'),
      short: 'صدایی نزدیک به آواز انسان؛ آرشه‌ی اسب همراه.', desc: 'کاسه‌ی کروی توت و پوست ماهی. پایه‌ی فلزی، آرشه‌ی موی اسب و کلافون همراه.', price: T(19500), compare: T(22000), stock: 3, weight: 1500, brand: 'کارگاه فرهادی', maker: 'استاد رضا فرهادی', featured: true,
      specs: [{ key: 'سیم', value: '۴' }, { key: 'کاسه', value: 'توت' }], tags: ['کمانچه'], rating: 4.8, ratingCount: 15, sold: 9 },
    { title: 'جعبه‌ی سه‌تار — فایبرگلاس، آستر مخمل', cat: cats.case, instrument: inst['سه‌تار'], art: 'case',
      short: 'محافظت کامل در سفر؛ سبک، ضدضربه و ضدآب.', desc: 'بدنه‌ی فایبرگلاس با آستر مخمل، قفل فلزی، بند کوله‌ای و جیب داخلی.', price: T(2450), stock: 24, weight: 1800, brand: 'دکتر ساز',
      specs: [{ key: 'جنس', value: 'فایبرگلاس' }], tags: ['جعبه'], rating: 4.5, ratingCount: 52, sold: 118 },
    { title: 'سیم سه‌تار — بسته‌ی کامل چهار سیم', cat: cats.strings, instrument: inst['سه‌تار'], art: 'strings',
      short: 'سیم فولادی روکش‌دار، کوک پایدار، ساخت آلمان.', desc: 'بسته‌ی کامل چهار سیم با روکش برنجی. عمر مفید بالا.', price: T(320), compare: T(390), stock: 150, weight: 40, brand: 'Roslau',
      specs: [{ key: 'تعداد', value: '۴' }], tags: ['سیم'], rating: 4.4, ratingCount: 210, sold: 640 },
    { title: 'مضراب تار — استخوانی دست‌تراش', cat: cats.strings, instrument: inst['تار'], art: 'strings',
      short: 'مضراب استخوانی با موم زنبور طبیعی.', desc: 'دست‌تراش از استخوان با دسته‌ی موم زنبور. سه ضخامت مختلف.', price: T(680), stock: 45, weight: 30, brand: 'دکتر ساز',
      variants: [{ name: 'نازک', priceDiff: 0, stock: 15 }, { name: 'متوسط', priceDiff: 0, stock: 20 }, { name: 'ضخیم', priceDiff: 0, stock: 10 }], specs: [{ key: 'جنس', value: 'استخوان' }], tags: ['مضراب'], rating: 4.7, ratingCount: 96, sold: 287 },
    { title: 'کوک‌کن دیجیتال کلیپسی', cat: cats.tuner, art: 'tuner',
      short: 'حالت اختصاصی برای کوک ربع‌پرده‌ای موسیقی ایرانی.', desc: 'کوک‌کن کلیپسی با نمایشگر رنگی، مناسب سه‌تار، تار، سنتور و کمانچه. دقت ۰٫۵ سنت.', price: T(890), compare: T(1100), stock: 60, weight: 60, brand: 'Cherub',
      specs: [{ key: 'دقت', value: '۰٫۵ سنت' }], tags: ['کوک'], rating: 4.6, ratingCount: 133, sold: 402 },
    { title: 'کتاب «ردیف میرزا عبدالله برای سه‌تار»', cat: cats.notes, instrument: inst['سه‌تار'], art: 'book',
      short: 'نسخه‌ی کامل نت‌نویسی‌شده‌ی ردیف، ۳۲۰ صفحه، چاپ رنگی.', desc: 'مجموعه‌ی کامل ردیف میرزا عبدالله با نت‌نویسی و انگشت‌گذاری. جلد سخت، همراه QR کد اجرای صوتی.', price: T(1850), stock: 30, weight: 900, brand: 'انتشارات ماهور',
      specs: [{ key: 'صفحه', value: '۳۲۰' }, { key: 'ناشر', value: 'ماهور' }], tags: ['کتاب'], rating: 4.9, ratingCount: 64, sold: 173 },
  ];

  const products: any[] = [];
  for (const p of P) {
    const vector = artFor(p);
    const cover = (p as any).photo || vector;
    const doc = await Product.create({
      title: p.title, slug: slug(p.title, `product-${Date.now()}-${Math.random()}`), shortDescription: p.short, description: p.desc,
      category: p.cat._id, instrument: p.instrument?._id || null, brand: p.brand || '', maker: (p as any).maker || '',
      coverImage: cover, fallbackImage: vector,
      gallery: [{ url: cover, type: 'image', alt: p.title }, { url: vector, type: 'image', alt: p.title }, { url: DEMO, type: 'video', poster: vector, alt: 'ویدیوی معرفی' }],
      price: p.price, compareAtPrice: (p as any).compare || 0, stock: p.stock, variants: (p as any).variants || [], specs: p.specs || [],
      weightGrams: p.weight || 0, tags: p.tags || [], ratingAvg: p.rating || 0, ratingCount: p.ratingCount || 0, soldCount: p.sold || 0,
      isFeatured: !!(p as any).featured, createdBy: admin._id,
    });
    products.push(doc);
  }

  await Review.create({ product: products[0]._id, user: user._id, rating: 5, comment: 'صدای فوق‌العاده‌ای داره. بسته‌بندی عالی و کوک پایدار.', isVerifiedBuyer: true });

  const pieceTitles = ['درآمد', 'کرشمه', 'زنگ شتر', 'نغمه', 'جامه‌دران', 'عشاق', 'رِنگ شهرآشوب'];
  const instArt: any = { 'سه‌تار': 'setar', 'تار': 'tar', 'دف': 'daf', 'سنتور': 'santur', 'هنگ‌درام': 'handpan', 'کمانچه': 'kamancheh' };
  const buildBook = async (instrument: any, title: string, price: number, count = 5) => {
    const book = await Book.create({ instrument: instrument._id, title, slug: slug(title, `book-${Date.now()}-${Math.random()}`), description: `${title} — دوره‌ای کامل با ویدیو، نت PDF و فایل صوتی.`, author: 'حامد حدادی', price, coverImage: ART(instArt[instrument.name] || 'book'), createdBy: admin._id });
    for (let n = 1; n <= count; n++) {
      await Piece.create({ book: book._id, instrument: instrument._id, title: `${n}. ${pieceTitles[(n - 1) % pieceTitles.length]}`, description: `آموزش گام‌به‌گام «${pieceTitles[(n - 1) % pieceTitles.length]}».`, order: n, price: T(120), author: 'حامد حدادی',
        introVideo: { url: DEMO, isFree: true }, pdf: { url: '', isFree: true }, lessonVideo: { url: DEMO, isFree: n <= 1 }, audioGuide: { url: '', isFree: false } });
    }
    return book;
  };
  const setarBook1 = await buildBook(inst['سه‌تار'], 'کتاب اول سه‌تار', T(680), 6);
  await buildBook(inst['سه‌تار'], 'کتاب دوم سه‌تار', T(820), 5);
  await buildBook(inst['تار'], 'کتاب اول تار', T(720), 5);
  await buildBook(inst['دف'], 'دوره‌ی جامع دف‌نوازی', T(560), 7);
  await buildBook(inst['هنگ‌درام'], 'هنگ‌درام از صفر', T(490), 4);

  await Package.create({ title: 'پکیج کامل سه‌تار', description: 'دسترسی مادام‌العمر به تمام کتاب‌ها و قطعات سه‌تار.', scope: 'instrument', instrument: inst['سه‌تار']._id, price: T(1290), coverImage: ART('setar'), createdBy: admin._id });
  await Package.create({ title: 'پکیج کامل تار', description: 'دسترسی مادام‌العمر به تمام کتاب‌ها و قطعات تار.', scope: 'instrument', instrument: inst['تار']._id, price: T(1180), coverImage: ART('tar'), createdBy: admin._id });
  await Package.create({ title: 'پکیج کتاب اول سه‌تار', description: 'همه‌ی قطعات کتاب اول با تخفیف.', scope: 'book', book: setarBook1._id, price: T(540), coverImage: ART('setar'), createdBy: admin._id });

  await Coupon.create({ code: 'NOWRUZ', type: 'percent', value: 15, maxDiscount: T(2000), minAmount: T(1000), isActive: true });
  await Coupon.create({ code: 'WELCOME', type: 'fixed', value: T(500), minAmount: T(3000), isActive: true });

  console.log('✅ داده‌های نمونه ساخته شد.');
  console.log('👤 مدیر : admin@doctoresaz.ir / 123456  (یا با موبایل 09120000000 وارد شوید)');
  console.log('🎟  کد تخفیف: NOWRUZ | WELCOME');
  await mongoose.disconnect();
  process.exit(0);
}
seed().catch((e) => { console.error(e); process.exit(1); });

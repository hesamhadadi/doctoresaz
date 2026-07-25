export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok } from '@/lib/api';
import Instrument from '@/models/Instrument';
export async function GET() { await connectDB(); return ok(await Instrument.find({ isPublished: true }).sort({ order: 1 }).lean<any>()); }

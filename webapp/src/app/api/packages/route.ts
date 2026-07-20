export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { ok } from '@/lib/api';
import Package from '@/models/Package';
export async function GET() { await connectDB(); return ok(await Package.find({ isPublished: true }).lean<any>()); }

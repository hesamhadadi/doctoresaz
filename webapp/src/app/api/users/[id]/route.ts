export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { ok, fail, requireRole } from '@/lib/api';
import User from '@/models/User';
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireRole('admin'); if (error) return error;
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const patch: any = {}; for (const k of ['role', 'isActive']) if (body[k] !== undefined) patch[k] = body[k];
  if (String(params.id) === String(session!.id) && patch.role && patch.role !== 'admin') return fail('نمی‌توانید نقش خودتان را تغییر دهید');
  return ok(await User.findByIdAndUpdate(params.id, patch, { new: true }));
}

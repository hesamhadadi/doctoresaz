export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ok } from '@/lib/api';
import User from '@/models/User';

export async function GET() {
  const session = await getSession();
  if (!session) return ok({ user: null });

  await connectDB();

  const user = (await User.findById(session.id).lean()) as any;
  if (!user) return ok({ user: null });

  return ok({
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    },
  });
}
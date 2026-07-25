export const dynamic = 'force-dynamic';
import { ok } from '@/lib/api';
import { SHIPPING_METHODS } from '@/lib/shipping';
export async function GET() { return ok(Object.values(SHIPPING_METHODS)); }

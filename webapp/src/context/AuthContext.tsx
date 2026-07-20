'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { apiGet, apiPost } from '@/lib/client';

interface User { id: string; name: string; phone?: string; email?: string; role: string; avatar?: string; bio?: string; createdAt?: string }
const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try { const { user } = await apiGet('/auth/me'); setUser(user); } catch { setUser(null); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const requestOtp = (phone: string) => apiPost('/auth/otp/request', { phone });
  const verifyOtp = async (phone: string, code: string, name?: string) => {
    const { user } = await apiPost('/auth/otp/verify', { phone, code, name }); setUser(user); return user;
  };
  const logout = useCallback(async () => { await apiPost('/auth/logout').catch(() => {}); setUser(null); }, []);
  return <AuthContext.Provider value={{ user, loading, requestOtp, verifyOtp, logout, refresh, isAdmin: user?.role === 'admin' }}>{children}</AuthContext.Provider>;
}

'use client';
import { ReactNode } from 'react';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider><AuthProvider><CartProvider><WishlistProvider>{children}</WishlistProvider></CartProvider></AuthProvider></ToastProvider>
  );
}

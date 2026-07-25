import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import PWA from '@/components/PWA';

export const metadata: Metadata = {
  title: 'دکتر ساز | فروشگاه و آموزش سازهای ایرانی',
  description: 'فروشگاه سازهای دست‌ساز ایرانی و مدرسه‌ی آنلاین موسیقی. سه‌تار، تار، دف، سنتور، هنگ‌درام — همراه با دوره‌های ویدیویی، نت و فایل صوتی.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'دکتر ساز' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#F7F1E6', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// اسکریپت بدون‌فلش: قبل از رندر، تم ذخیره‌شده را اعمال می‌کند (پیش‌فرض روشن)
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/YekanBakhFaNum-VF.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          {children}
          <PWA />
        </Providers>
      </body>
    </html>
  );
}

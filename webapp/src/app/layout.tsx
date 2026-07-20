import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'دکتر ساز | فروشگاه و آموزش سازهای ایرانی',
  description: 'فروشگاه سازهای دست‌ساز ایرانی و مدرسه‌ی آنلاین موسیقی. سه‌تار، تار، دف، سنتور، هنگ‌درام — همراه با دوره‌های ویدیویی، نت و فایل صوتی.',
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232FC2B4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'/%3E%3Ccircle cx='6' cy='18' r='3'/%3E%3Ccircle cx='18' cy='16' r='3'/%3E%3C/svg%3E" },
};
export const viewport: Viewport = { themeColor: '#F7F1E6', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// اسکریپت بدون‌فلش: قبل از رندر، تم ذخیره‌شده را اعمال می‌کند (پیش‌فرض روشن)
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Config } from 'tailwindcss';
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1320px' } },
    extend: {
      fontFamily: {
        sans: ['IRANSansX', 'Vazirmatn', 'system-ui', 'sans-serif'],
        display: ['IRANSansX', 'Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        // تم مبتنی بر متغیر CSS — روشن/تیره با کلاس .dark عوض می‌شود
        ink: { 950:v('ink-950'),900:v('ink-900'),850:v('ink-850'),800:v('ink-800'),750:v('ink-750'),700:v('ink-700'),600:v('ink-600'),500:v('ink-500'),400:v('ink-400'),300:v('ink-300'),200:v('ink-200'),100:v('ink-100'),50:v('ink-50') },
        firooze: { 50:v('fz-50'),100:v('fz-100'),200:v('fz-200'),300:v('fz-300'),400:v('fz-400'),500:v('fz-500'),600:v('fz-600'),700:v('fz-700'),800:v('fz-800'),900:v('fz-900') },
        zaferan: { 50:v('zf-50'),100:v('zf-100'),200:v('zf-200'),300:v('zf-300'),400:v('zf-400'),500:v('zf-500'),600:v('zf-600'),700:v('zf-700'),800:v('zf-800'),900:v('zf-900') },
        lajvard: { 500:'#2C5A82',700:'#1B3A57',900:'#101F30' },
        ajori: { 400:'#D06B45',500:'#C4552F',600:'#A6431F' },
        success:'#17A497', warning:'#E89B2E', danger:'#E5484D',
      },
      borderRadius: { xl:'0.875rem','2xl':'1.25rem','3xl':'1.75rem' },
      boxShadow: {
        soft:'0 1px 2px rgb(var(--shadow)/.10), 0 8px 24px -12px rgb(var(--shadow)/.18)',
        lift:'0 2px 4px rgb(var(--shadow)/.10), 0 24px 48px -24px rgb(var(--shadow)/.28)',
        glow:'0 0 0 1px rgba(23,164,151,.18), 0 8px 32px -8px rgba(23,164,151,.28)',
        'glow-z':'0 0 0 1px rgba(232,155,46,.2), 0 8px 32px -8px rgba(232,155,46,.28)',
      },
      backgroundImage: {
        'grad-firooze':'linear-gradient(135deg,#2FC2B4 0%,#17A497 55%,#0F857B 100%)',
        'grad-zaferan':'linear-gradient(135deg,#F0B455 0%,#E89B2E 55%,#D07E17 100%)',
        'grad-ink':'linear-gradient(180deg, rgb(var(--ink-850)) 0%, rgb(var(--ink-900)) 100%)',
        'grad-fade':'linear-gradient(180deg,transparent 0%,rgb(var(--ink-950)/.85) 70%,rgb(var(--ink-950)) 100%)',
      },
      opacity: { 4:'0.04',5:'0.05',6:'0.06',7:'0.07',8:'0.08',12:'0.12',15:'0.15',18:'0.18',22:'0.22',25:'0.25',35:'0.35',45:'0.45',55:'0.55',65:'0.65',85:'0.85',92:'0.92',98:'0.98' },
      keyframes: {
        'fade-up':{'0%':{opacity:'0',transform:'translateY(12px)'},'100%':{opacity:'1',transform:'none'}},
        'fade-in':{'0%':{opacity:'0'},'100%':{opacity:'1'}},
        'scale-in':{'0%':{opacity:'0',transform:'scale(.96)'},'100%':{opacity:'1',transform:'none'}},
        'slide-in-right':{'0%':{transform:'translateX(-100%)'},'100%':{transform:'none'}},
        shimmer:{'100%':{transform:'translateX(-200%)'}},
        string:{'0%,100%':{transform:'scaleY(.35)',opacity:'.35'},'50%':{transform:'scaleY(1)',opacity:'1'}},
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-8px)'}},
        'spin-slow':{to:{transform:'rotate(360deg)'}},
      },
      animation: {
        'fade-up':'fade-up .5s cubic-bezier(.22,1,.36,1) both','fade-in':'fade-in .4s ease both',
        'scale-in':'scale-in .3s cubic-bezier(.22,1,.36,1) both','slide-in-right':'slide-in-right .3s cubic-bezier(.22,1,.36,1) both',
        shimmer:'shimmer 1.6s infinite',string:'string 1.4s ease-in-out infinite',float:'float 6s ease-in-out infinite','spin-slow':'spin-slow 28s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;

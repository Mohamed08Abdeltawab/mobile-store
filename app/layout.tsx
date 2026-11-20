import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "./context/CartContext";
import ClientStoreWrapper from "./components/ClientStoreWrapper";

export const metadata = {
  title: "موبايل ستور | متجر الهواتف الذكية والأجهزة الإلكترونية بضمان معتمد",
  description: "متجر Mobile Store المتخصص في بيع الهواتف الذكية والتابلت والسماعات والشواحن والإكسسوارات الأصلية. منتجات أصلية 100%، فحص ومعاينة دقيقة قبل الدفع، شحن سريع لجميع المحافظات.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23A3E635'><rect x='5' y='2' width='14' height='20' rx='3' stroke='%23101211' stroke-width='2'/><circle cx='12' cy='18' r='1' fill='%23101211'/></svg>"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=localStorage.getItem("mobile_brand_colors");if(!c)return;var p=JSON.parse(c);if(!p||!p.primary)return;function h(x){var s=x.replace("#","").trim();if(s.length===3)s=s.split("").map(function(k){return k+k;}).join("");var n=parseInt(s,16);if(isNaN(n))return{r:163,g:230,b:53};return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}function b(x,f){var o=h(x);var r=Math.min(255,Math.max(0,Math.round(o.r*f)));var g=Math.min(255,Math.max(0,Math.round(o.g*f)));var bl=Math.min(255,Math.max(0,Math.round(o.b*f)));return"#"+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);}function t(x){var o=h(x);return((o.r*299+o.g*587+o.b*114)/1000)>=140?"#000000":"#ffffff";}var pr=p.primary;var se=p.secondary||"#10B981";var ro=document.documentElement.style;var o1=h(pr);var o2=h(se);ro.setProperty("--brand-primary",pr);ro.setProperty("--brand-primary-hover",b(pr,0.88));ro.setProperty("--brand-primary-text",t(pr));ro.setProperty("--brand-primary-glow","rgba("+o1.r+","+o1.g+","+o1.b+",0.35)");ro.setProperty("--brand-primary-light","rgba("+o1.r+","+o1.g+","+o1.b+",0.15)");ro.setProperty("--brand-secondary",se);ro.setProperty("--brand-secondary-hover",b(se,0.88));ro.setProperty("--brand-secondary-text",t(se));ro.setProperty("--brand-secondary-glow","rgba("+o2.r+","+o2.g+","+o2.b+",0.35)");ro.setProperty("--brand-secondary-light","rgba("+o2.r+","+o2.g+","+o2.b+",0.15)");ro.setProperty("--color-accent-green",pr);ro.setProperty("--color-lime-400",pr);ro.setProperty("--color-lime-500",b(pr,0.88));}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f8faf8] text-[#131715] font-sans antialiased selection:bg-lime-400 selection:text-black overflow-x-hidden">
        <CartProvider>
          <ClientStoreWrapper>
            {children}
          </ClientStoreWrapper>
        </CartProvider>
      </body>
    </html>
  );
}

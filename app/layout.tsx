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

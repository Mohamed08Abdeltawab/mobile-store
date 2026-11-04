"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import MobileMenuDrawer from "./MobileMenuDrawer";
import MobileBottomNav from "./MobileBottomNav";
import CheckoutModal from "./CheckoutModal";
import QuickViewModal from "./QuickViewModal";
import SearchModal from "./SearchModal";
import ToastContainer from "./ToastContainer";

export default function ClientStoreWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main id="main" className="min-w-0 w-full overflow-x-clip">{children}</main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <MobileMenuDrawer />
      <MobileBottomNav />
      <CheckoutModal />
      <QuickViewModal />
      <SearchModal />
      <ToastContainer />
    </>
  );
}

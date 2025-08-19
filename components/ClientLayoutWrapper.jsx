'use client';

import React from 'react';
import FixedMenu from './FixedMenu';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const noMenuPaths = ['/signup', '/admin', '/counselor/dashboard'];
  const noFooterPaths = ['/signup', '/admin', '/counselor/dashboard'];

  // Check if the current path is the root path
  const isHomePage = pathname === '/';

  const showMenu = !noMenuPaths.some(path => pathname.startsWith(path));
  const showFooter = !noFooterPaths.some(path => pathname.startsWith(path));

  return (
    <>
      {children}
      {/* Do not render FixedMenu and Footer on the home page */}
      {!isHomePage && showMenu && <FixedMenu />}
      {!isHomePage && showFooter && <Footer />}
    </>
  );
}
export default ClientLayoutWrapper;
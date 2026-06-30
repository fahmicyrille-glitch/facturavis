'use client';

import React, { useState, useCallback } from 'react';
import { AlertCircle, X, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[#f0e6de]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 md:gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4b494] to-[#a9825a] rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <Image src="/logo/logo.png" alt="Logo FacturAvis" width={40} height={40} className="relative w-8 h-8 md:w-10 md:h-10 object-contain rounded-xl shadow-sm" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter text-[#3e2f25]">FacturAvis</span>
        </Link>
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-[#7a6a5f]">
          <a href="#reforme" className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition"><AlertCircle size={14}/> R&eacute;forme 2026</a>
          <a href="#fonctionnalites" className="hover:text-[#a9825a] transition">Fonctionnalit&eacute;s</a>
          <a href="#tarifs" className="hover:text-[#a9825a] transition">Tarifs</a>
          <a href="#contact" className="hover:text-[#a9825a] transition">Contact</a>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/login" className="hidden sm:block text-xs md:text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] px-3 py-2 transition">
            Connexion
          </Link>
          <Link href="/inscription" className="relative group overflow-hidden bg-[#3e2f25] text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold shadow-lg shadow-[#3e2f25]/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
            <span className="relative z-10">S&apos;inscrire</span>
            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          </Link>

          {/* Hamburger button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#3e2f25] hover:bg-[#fdf2e9] transition-colors"
            aria-label="Menu de navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-[#f0e6de] shadow-lg animate-slideDown">
          <div className="flex flex-col px-4 py-4 space-y-1 max-w-7xl mx-auto">
            <a href="#reforme" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all">
              <AlertCircle size={14}/> R&eacute;forme 2026
            </a>
            <a href="#fonctionnalites" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7a6a5f] hover:text-[#a9825a] hover:bg-[#fdf2e9] transition-all">
              Fonctionnalit&eacute;s
            </a>
            <a href="#tarifs" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7a6a5f] hover:text-[#a9825a] hover:bg-[#fdf2e9] transition-all">
              Tarifs
            </a>
            <a href="#contact" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7a6a5f] hover:text-[#a9825a] hover:bg-[#fdf2e9] transition-all">
              Contact
            </a>
            <div className="border-t border-[#f0e6de] my-2"></div>
            <Link href="/login" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#7a6a5f] hover:text-[#3e2f25] hover:bg-[#fdf2e9] transition-all">
              Connexion
            </Link>
            <Link href="/inscription" onClick={closeMobileMenu} className="flex items-center justify-center gap-2 bg-[#3e2f25] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#3e2f25]/20 hover:shadow-xl transition-all mt-1">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

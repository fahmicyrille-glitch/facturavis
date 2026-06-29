'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Link
        href="/inscription"
        className="group flex items-center gap-2.5 bg-[#3e2f25] hover:bg-[#2e2019] text-white font-black text-sm px-5 py-3.5 rounded-2xl shadow-2xl shadow-[#3e2f25]/40 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
      >
        {/* Pastille verte */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </span>
        <span>
          Tester gratuitement
          <span className="block text-[10px] font-semibold text-[#d4b494] leading-none mt-0.5">
            Sans carte bancaire
          </span>
        </span>
        {/* Flèche */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-white shadow-lg">
      <nav className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              <span className="text-amber-500">Ahlafors</span>
              <span className="text-white"> Bryggeri</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/produkter" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Produkter
            </Link>
            <Link href="/rulleriet" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Rulleriet
            </Link>
            <Link href="/recept" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Recept
            </Link>
            <Link href="/tjanster" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Tjänster
            </Link>
            <Link href="/om-oss" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Om oss
            </Link>
            <Link href="/kontakt" className="hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Kontakt
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link href="/produkter" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Produkter
            </Link>
            <Link href="/rulleriet" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Rulleriet
            </Link>
            <Link href="/recept" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Recept
            </Link>
            <Link href="/tjanster" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Tjänster
            </Link>
            <Link href="/om-oss" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Om oss
            </Link>
            <Link href="/kontakt" className="block hover:text-amber-500 transition-colors uppercase text-sm tracking-wider font-semibold">
              Kontakt
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

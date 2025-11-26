"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/produkter", label: "Produkter" },
  { href: "/rulleriet", label: "Rulleriet" },
  { href: "/recept", label: "Recept" },
  { href: "/tjanster", label: "Tjänster" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-white shadow-lg">
      <nav className="container-custom relative">
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative text-sm font-semibold uppercase tracking-wider transition-colors duration-150 hover:text-amber-400"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 block h-0.5 w-full scale-x-0 bg-amber-400 transition-transform duration-200 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-full border border-stone-700/70 bg-stone-800/70 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:border-amber-500 hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">Öppna eller stäng menyn</span>
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
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              aria-hidden
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute inset-x-0 z-50 px-4 pb-6" id="mobile-navigation">
              <div className="mt-3 overflow-hidden rounded-2xl border border-stone-800/80 bg-gradient-to-b from-stone-900 to-stone-950 shadow-2xl ring-1 ring-amber-500/10">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wider text-amber-50 transition hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    <span>{item.label}</span>
                    <span className="translate-y-0.5 text-xs text-amber-300 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

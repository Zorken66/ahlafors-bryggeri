import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Om Bryggeriet */}
          <div>
            <h3 className="text-amber-500 font-serif text-xl font-bold mb-4">Ahlafors Bryggeri</h3>
            <p className="text-sm leading-relaxed">
              Hantverk i varje droppe sedan 1996. Mikrobryggeri i hjärtat av den historiska spinnerifabriken i Alafors.
            </p>
          </div>

          {/* Snabblänkar */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produkter" className="hover:text-amber-500 transition-colors">Produkter</Link></li>
              <li><Link href="/rulleriet" className="hover:text-amber-500 transition-colors">Rulleriet</Link></li>
              <li><Link href="/recept" className="hover:text-amber-500 transition-colors">Recept</Link></li>
              <li><Link href="/tjanster" className="hover:text-amber-500 transition-colors">Tjänster</Link></li>
              <li><Link href="/om-oss" className="hover:text-amber-500 transition-colors">Om oss</Link></li>
              <li><Link href="/kontakt" className="hover:text-amber-500 transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li>Spinnerigatan</li>
              <li>449 41 Alafors</li>
              <li>Ale kommun</li>
              <li className="pt-2">
                <Link href="/kontakt" className="hover:text-amber-500 transition-colors">
                  Kontakta oss
                </Link>
              </li>
            </ul>
          </div>

          {/* Sociala Medier */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Följ oss</h4>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/AhlaforsBryggerier/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/ahlaforsbryggerier/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-700 mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Ahlafors Bryggerier AB. Alla rättigheter förbehållna.</p>
          <p className="mt-2 text-stone-400">Njut ansvarsfullt. Våra produkter innehåller alkohol.</p>
        </div>
      </div>
    </footer>
  );
}

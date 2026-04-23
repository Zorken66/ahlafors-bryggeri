import Link from "next/link";

import { readSiteContent } from "@/lib/content-store";

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform.toLowerCase()) {
    case "facebook":
      return (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92C2.174 15.584 2.163 15.205 2.163 12c0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838A6.162 6.162 0 1 0 12 18a6.162 6.162 0 0 0 0-12.324zm0 10.162A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
        </svg>
      );
    default:
      return <span className="text-sm font-semibold uppercase tracking-[0.2em]">{platform}</span>;
  }
}

export default async function Footer() {
  const { site } = await readSiteContent();
  const footer = site.footer;

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12">
          <div>
            <h3 className="mb-4 font-serif text-xl font-bold text-amber-500">{footer.brandHeading}</h3>
            <p className="text-sm leading-relaxed">{footer.brandText}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{footer.navigationTitle}</h4>
            <ul className="space-y-2 text-sm">
              {footer.navigationLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  {isExternalHref(link.href) ? (
                    <a href={link.href} className="transition-colors hover:text-amber-500" target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="transition-colors hover:text-amber-500">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{footer.contactTitle}</h4>
            <ul className="space-y-2 text-sm">
              {footer.contactLines.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
              {footer.contactLinkLabel && footer.contactLinkHref ? (
                <li className="pt-2">
                  {isExternalHref(footer.contactLinkHref) ? (
                    <a href={footer.contactLinkHref} className="transition-colors hover:text-amber-500" target="_blank" rel="noopener noreferrer">
                      {footer.contactLinkLabel}
                    </a>
                  ) : (
                    <Link href={footer.contactLinkHref} className="transition-colors hover:text-amber-500">
                      {footer.contactLinkLabel}
                    </Link>
                  )}
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{footer.socialTitle}</h4>
            <div className="flex flex-wrap gap-4">
              {footer.socialLinks.map((link) => (
                <a
                  key={`${link.platform}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-amber-500"
                  aria-label={link.platform}
                  title={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-700 pt-8 text-center text-sm">
          <p>{footer.legalText}</p>
          <p className="mt-2 text-stone-400">{footer.disclaimerText}</p>
        </div>
      </div>
    </footer>
  );
}

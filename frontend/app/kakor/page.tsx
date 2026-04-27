import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kakor | Ahlafors Bryggeri",
  description: "Information om kakor och cookieinställningar på Ahlafors Bryggeriers webbplats.",
};

const cookieRows = [
  {
    name: "ahlafors_cookie_consent",
    purpose: "Sparar ditt val för kakor på webbplatsen.",
    duration: "6 månader",
    category: "Nödvändig",
  },
  {
    name: "cms_session",
    purpose: "Håller dig inloggad i CMS-admin. Används bara under /admin när du loggar in.",
    duration: "Upp till 8 timmar",
    category: "Nödvändig",
  },
];

export default function CookiesPage() {
  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Kakor</p>
          <h1 className="mt-3 text-4xl font-bold text-stone-900">Så använder vi kakor</h1>
          <div className="mt-6 space-y-4 text-base leading-8 text-stone-700">
            <p>
              Vi använder så få kakor som möjligt. På den publika sajten används i dag bara nödvändiga kakor
              för att komma ihåg ditt val för kakor. Om du loggar in i CMS-admin används också en nödvändig sessionskaka.
            </p>
            <p>
              Vi använder just nu inga aktiva statistik- eller marknadsföringskakor på den publika sajten.
              Om det ändras kan du uppdatera ditt val via knappen <span className="font-semibold">Cookie-inställningar</span> i footern.
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Namn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Syfte</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">Lagringstid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {cookieRows.map((row) => (
                <tr key={row.name}>
                  <td className="px-6 py-5 align-top font-mono text-sm text-stone-900">{row.name}</td>
                  <td className="px-6 py-5 align-top text-sm font-semibold text-stone-700">{row.category}</td>
                  <td className="px-6 py-5 align-top text-sm leading-6 text-stone-700">{row.purpose}</td>
                  <td className="px-6 py-5 align-top text-sm text-stone-700">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

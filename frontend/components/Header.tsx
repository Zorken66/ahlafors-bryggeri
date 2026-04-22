import HeaderNav from "@/components/HeaderNav";
import { getCmsSession } from "@/lib/cms-auth";

const navItems = [
  { href: "/produkter", label: "Produkter" },
  { href: "/rulleriet", label: "Rulleriet" },
  { href: "/recept", label: "Recept" },
  { href: "/tjanster", label: "Tjänster" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
];

export default async function Header() {
  const session = await getCmsSession();
  const items = session ? [...navItems, { href: "/admin", label: "Admin" }] : navItems;

  return <HeaderNav navItems={items} />;
}

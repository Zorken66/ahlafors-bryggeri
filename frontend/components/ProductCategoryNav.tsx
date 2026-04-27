"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ProductCategory = {
  id: string;
  name: string;
  icon?: string;
};

function buildCategoryHref(pathname: string, searchParams: URLSearchParams, categoryId: string) {
  const nextParams = new URLSearchParams(searchParams.toString());

  if (categoryId === "alla") {
    nextParams.delete("category");
  } else {
    nextParams.set("category", categoryId);
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function ProductCategoryNav({
  categories,
  activeCategory,
}: {
  categories: ProductCategory[];
  activeCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <section className="sticky top-[72px] z-40 border-b-2 border-amber-500 bg-white shadow-md md:top-[84px]">
      <div className="container-custom px-4 py-4 md:px-6">
        <div className="md:hidden">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Välj kategori
            </span>
            <select
              value={activeCategory}
              onChange={(event) => {
                const href = buildCategoryHref(pathname, new URLSearchParams(searchParams.toString()), event.target.value);
                router.push(href, { scroll: false });
              }}
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-600"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}{category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="hidden md:block">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildCategoryHref(pathname, new URLSearchParams(searchParams.toString()), category.id)}
                scroll={false}
                className={`shrink-0 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category.id
                    ? "bg-amber-600 text-white shadow-lg scale-105"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:shadow-md"
                }`}
              >
                {category.icon ? <span className="mr-2">{category.icon}</span> : null}
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

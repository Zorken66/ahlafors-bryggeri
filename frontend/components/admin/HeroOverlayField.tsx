"use client";

type HeroOverlayFieldProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
};

export default function HeroOverlayField({
  label = "Mörkt överlägg på hero-bilden",
  value,
  onChange,
}: HeroOverlayFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <div className="rounded-2xl border border-stone-300 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full accent-amber-700"
          />
          <span className="min-w-14 rounded-full bg-stone-100 px-3 py-1 text-center text-sm font-semibold text-stone-700">
            {value}%
          </span>
        </div>
        <p className="mt-3 text-xs text-stone-500">0% = inget överlägg, 100% = mycket mörkt överlägg.</p>
      </div>
    </label>
  );
}

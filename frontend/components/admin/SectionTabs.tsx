"use client";

type SectionTab = {
  id: string;
  label: string;
};

export default function SectionTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: SectionTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-amber-700 text-white shadow-md"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

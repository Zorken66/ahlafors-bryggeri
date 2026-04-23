"use client";

import type { QualityIssue } from "@/lib/content-quality";
import { summarizeQualityIssues } from "@/lib/content-quality";

export default function QualityChecklist({
  title = "Kvalitetskontroll",
  issues,
}: {
  title?: string;
  issues: QualityIssue[];
}) {
  const summary = summarizeQualityIssues(issues);

  if (issues.length === 0) {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-green-900">{title}</h3>
            <p className="mt-1 text-sm text-green-800">Inga fel eller varningar. Innehållet ser redo ut.</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Redo</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
          <p className="mt-1 text-sm text-stone-600">Det här behöver du åtgärda eller ta ställning till innan publicering.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">{summary.errors} fel</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{summary.warnings} varningar</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {issues.map((issue) => (
          <div
            key={`${issue.severity}-${issue.code}-${issue.field}-${issue.message}`}
            className={`rounded-xl border px-3 py-3 text-sm ${
              issue.severity === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <span className="font-semibold">{issue.severity === "error" ? "Fel" : "Varning"}:</span> {issue.message}
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { summarizeQualityIssues, type QualityIssue } from "@/lib/content-quality";

export default function QualityStatusBadge({
  issues,
}: {
  issues: QualityIssue[];
}) {
  const summary = summarizeQualityIssues(issues);

  if (summary.errors > 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
        {summary.errors} fel
      </span>
    );
  }

  if (summary.warnings > 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
        {summary.warnings} varningar
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
      Redo
    </span>
  );
}

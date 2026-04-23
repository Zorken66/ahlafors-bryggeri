"use client";

import { getQualityIssuesForField, type QualityIssue } from "@/lib/content-quality";

export default function FieldIssueHint({
  issues,
  field,
}: {
  issues: QualityIssue[];
  field: string;
}) {
  const fieldIssues = getQualityIssuesForField(issues, field);

  if (fieldIssues.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {fieldIssues.map((issue) => (
        <p
          key={`${issue.code}-${issue.field}-${issue.message}`}
          className={`text-xs ${issue.severity === "error" ? "text-red-700" : "text-amber-700"}`}
        >
          {issue.severity === "error" ? "Fel:" : "Varning:"} {issue.message}
        </p>
      ))}
    </div>
  );
}

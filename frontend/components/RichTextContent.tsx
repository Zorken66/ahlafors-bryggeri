import { sanitizeRichText } from "@/lib/rich-text";

export default function RichTextContent({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  if (!value.trim()) {
    return null;
  }

  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}

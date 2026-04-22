"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  helperText?: string;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[180px]",
  helperText,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML === value) {
      return;
    }

    editorRef.current.innerHTML = value;
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function handleLink() {
    const url = window.prompt("Länkadress", "https://");
    if (!url) {
      return;
    }

    runCommand("createLink", url);
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <div className="overflow-hidden rounded-2xl border border-stone-300 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-stone-200 bg-stone-50 p-3">
          <ToolbarButton label="B" onClick={() => runCommand("bold")} />
          <ToolbarButton label="I" onClick={() => runCommand("italic")} />
          <ToolbarButton label="U" onClick={() => runCommand("underline")} />
          <ToolbarButton label="Länk" onClick={handleLink} />
          <ToolbarButton label="Lista" onClick={() => runCommand("insertUnorderedList")} />
          <ToolbarButton label="Nummer" onClick={() => runCommand("insertOrderedList")} />
          <ToolbarButton label="Citat" onClick={() => runCommand("formatBlock", "blockquote")} />
          <ToolbarButton label="Rubrik" onClick={() => runCommand("formatBlock", "h3")} />
          <ToolbarButton label="Text" onClick={() => runCommand("formatBlock", "p")} />
          <ToolbarButton label="Rensa" onClick={() => runCommand("removeFormat")} />
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder ?? ""}
          onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
          className={`${minHeightClassName} rich-text-editor w-full px-4 py-3 outline-none`}
        />
      </div>
      {helperText && <p className="mt-2 text-xs text-stone-500">{helperText}</p>}
    </label>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-600 hover:text-amber-700"
    >
      {label}
    </button>
  );
}

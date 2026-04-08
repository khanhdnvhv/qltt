import { useMemo } from "react";

/**
 * HighlightText - Highlights matched search text within a string.
 * Splits text by search query and wraps matched parts in a styled <mark>.
 * Case-insensitive. Returns original text if query is empty.
 */
export function HighlightText({
  text,
  query,
  className = "",
  highlightClassName = "bg-primary/15 text-primary rounded-[2px] px-[1px]",
}: {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}) {
  const parts = useMemo(() => {
    if (!query || !query.trim()) return [{ text, match: false }];
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const splits = text.split(regex);
    return splits.map((part) => ({
      text: part,
      match: regex.test(part) ? true : part.toLowerCase() === query.toLowerCase(),
    }));
  }, [text, query]);

  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <mark key={i} className={highlightClassName} style={{ fontWeight: "inherit" }}>
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}


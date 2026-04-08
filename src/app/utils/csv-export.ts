/**
 * CSV Export Utility
 * Converts array of objects to CSV and triggers download.
 * Handles escaping, UTF-8 BOM for Excel compatibility, and Vietnamese characters.
 */

interface CsvColumn<T> {
  key: string;
  header: string;
  /** Custom value formatter. Defaults to String(value). */
  format?: (item: T) => string;
}

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCsv<T>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string = "export.csv"
) {
  // Header row
  const headerRow = columns.map((col) => escapeCsvValue(col.header)).join(",");

  // Data rows
  const dataRows = data.map((item) =>
    columns
      .map((col) => {
        const raw = col.format
          ? col.format(item)
          : String((item as Record<string, unknown>)[col.key] ?? "");
        return escapeCsvValue(raw);
      })
      .join(",")
  );

  // UTF-8 BOM for Excel Vietnamese support
  const BOM = "\uFEFF";
  const csvContent = BOM + [headerRow, ...dataRows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

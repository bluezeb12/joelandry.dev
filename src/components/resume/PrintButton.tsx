"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      className="toolbar-button no-print"
      onClick={() => window.print()}
      title="Print / Save as PDF"
      aria-label="Print resume"
      id="print-button"
    >
      <Printer />
    </button>
  );
}

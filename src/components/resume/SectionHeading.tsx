interface SectionHeadingProps {
  command: string;
  title?: string;
}

export function SectionHeading({ command, title }: SectionHeadingProps) {
  return (
    <h2 className="section-heading">
      <span className="prompt no-print">$</span>
      <span className="no-print">{command}</span>
      {title && <span className="print-only">{title}</span>}
      <span className="cursor no-print" aria-hidden="true" />
    </h2>
  );
}

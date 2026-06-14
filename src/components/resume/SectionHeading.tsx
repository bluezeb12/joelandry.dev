interface SectionHeadingProps {
  command: string;
}

export function SectionHeading({ command }: SectionHeadingProps) {
  return (
    <h2 className="section-heading">
      <span className="prompt">$</span>
      <span>{command}</span>
      <span className="cursor" aria-hidden="true" />
    </h2>
  );
}

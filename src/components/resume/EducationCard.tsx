import type { Education } from "@/lib/schema";

interface EducationCardProps {
  education: Education;
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function EducationCard({ education }: EducationCardProps) {
  return (
    <div className="education-card">
      <div className="education-institution">{education.institution}</div>
      <div className="education-degree">
        {education.degree} in {education.field}
      </div>
      <div className="education-meta">
        {formatDate(education.startDate)} – {formatDate(education.graduationDate)}
        {education.location && ` · ${education.location}`}
      </div>
      {education.coursework && education.coursework.length > 0 && (
        <div className="education-coursework">
          {education.coursework.map((course) => (
            <span key={course} className="skill-tag">
              {course}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

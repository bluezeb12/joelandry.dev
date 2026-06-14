import type { Experience } from "@/lib/schema";

interface ExperienceCardProps {
  experience: Experience;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Present";
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const showTypeBadge = experience.type !== "full-time";

  return (
    <div className="experience-card">
      <div className="experience-header">
        <div className="experience-company">
          {experience.company}
          {experience.division && (
            <span className="experience-division">
              {" "}
              — {experience.division}
            </span>
          )}
        </div>
        <div className="experience-role">{experience.role}</div>
      </div>

      <div className="experience-meta">
        <span>
          {formatDate(experience.startDate)} –{" "}
          {formatDate(experience.endDate)}
        </span>
        {experience.location && <span>{experience.location}</span>}
        {showTypeBadge && (
          <span className="experience-type-badge">{experience.type}</span>
        )}
      </div>

      <ul className="experience-highlights">
        {experience.highlights.map((highlight, i) => (
          <li key={i}>{highlight}</li>
        ))}
      </ul>

      {experience.tags.length > 0 && (
        <div className="experience-tags">
          {experience.tags.map((tag) => (
            <span key={tag} className="skill-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Experience } from "@/lib/schema";
import { ExperienceCard } from "./ExperienceCard";

interface ExperienceTimelineProps {
  experiences: Experience[];
}

export function ExperienceTimeline({ experiences }: ExperienceTimelineProps) {
  return (
    <div className="timeline stagger">
      {experiences.map((exp) => (
        <div key={exp.id} className="timeline-item animate-fade-in-up">
          <ExperienceCard experience={exp} />
        </div>
      ))}
    </div>
  );
}

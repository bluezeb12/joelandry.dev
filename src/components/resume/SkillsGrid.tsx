interface SkillsGridProps {
  skills: Record<string, string[]>;
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  return (
    <div className="stagger">
      {Object.entries(skills).map(([category, items]) => (
        <div key={category} className="skills-category animate-fade-in-up">
          <div className="skills-category-label">{category}</div>
          <div className="skills-category-tags">
            {items.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTailoredResume } from "@/lib/data";
import {
  TerminalWindow,
  SectionHeading,
  ResumeHeader,
  ExperienceTimeline,
  SkillsGrid,
  EducationCard,
  PrintButton,
  ThemeToggle,
} from "@/components/resume";

export const runtime = "edge";

export default async function TailoredResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getTailoredResume(slug);

  if (!result) {
    notFound();
  }

  const { resume, application } = result;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "3rem 1rem",
        maxWidth: "var(--max-width)",
        margin: "0 auto",
      }}
    >
      {/* ─── Toolbar ──────────────────────────────────────────────── */}
      <div className="toolbar">
        <ThemeToggle />
        <PrintButton />
      </div>

      {/* ─── Application Intro ────────────────────────────────────── */}
      {(application.customIntro || application.roleName) && (
        <div className="resume-section">
          <TerminalWindow title={`~/apply/${slug}`}>
            <div style={{ textAlign: "center" }}>
              <span className="application-role-badge">
                {application.roleName} @ {application.companyName}
              </span>
            </div>
            {application.customIntro && (
              <div className="application-intro" style={{ marginTop: "1rem" }}>
                {application.customIntro}
              </div>
            )}
          </TerminalWindow>
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="resume-section">
        <TerminalWindow title="~/joseph-landry/about.json">
          <ResumeHeader meta={resume.meta} />
        </TerminalWindow>
      </div>

      {/* ─── Experience ───────────────────────────────────────────── */}
      <div className="resume-section">
        <TerminalWindow title="~/joseph-landry/experience">
          <SectionHeading command="cat experience.json" title="Experience" />
          <ExperienceTimeline experiences={resume.experience} />
        </TerminalWindow>
      </div>

      {/* ─── Skills ───────────────────────────────────────────────── */}
      <div className="resume-section">
        <TerminalWindow title="~/joseph-landry/skills">
          <SectionHeading command="ls skills/" title="Skills" />
          <SkillsGrid skills={resume.skills} />
        </TerminalWindow>
      </div>

      {/* ─── Education ────────────────────────────────────────────── */}
      <div className="resume-section">
        <TerminalWindow title="~/joseph-landry/education">
          <SectionHeading command="cat education.json" title="Education" />
          {resume.education.map((edu) => (
            <EducationCard key={edu.id} education={edu} />
          ))}
        </TerminalWindow>
      </div>
    </main>
  );
}

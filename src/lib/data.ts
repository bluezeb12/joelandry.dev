import fs from "fs/promises";
import path from "path";
import {
  ResumeSchema,
  ApplicationSchema,
  type Resume,
  type ApplicationConfig,
} from "./schema";

// ─── Resume ─────────────────────────────────────────────────────────────────

/**
 * Reads and validates the master resume JSON.
 * Throws a ZodError if the data doesn't match the schema.
 */
export async function getResume(): Promise<Resume> {
  const filePath = path.join(process.cwd(), "src/data/resume.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return ResumeSchema.parse(JSON.parse(raw));
}

// ─── Applications ───────────────────────────────────────────────────────────

/**
 * Reads and validates a single application config by slug.
 * Returns null if the application file doesn't exist.
 */
export async function getApplication(
  slug: string
): Promise<ApplicationConfig | null> {
  const filePath = path.join(
    process.cwd(),
    `src/data/applications/${slug}.json`
  );

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return ApplicationSchema.parse(JSON.parse(raw));
  } catch (err) {
    // File doesn't exist — not a valid application slug
    if (err instanceof Error && "code" in err && err.code === "ENOENT") {
      return null;
    }
    // Zod validation error or other issue — re-throw
    throw err;
  }
}

/**
 * Lists all available application slugs by scanning the applications directory.
 * Excludes the _template.json file.
 */
export async function listApplicationSlugs(): Promise<string[]> {
  const dirPath = path.join(process.cwd(), "src/data/applications");

  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

// ─── Tailored Resume ────────────────────────────────────────────────────────

/**
 * Combines the master resume with an application config to produce a
 * filtered Resume object showing only the relevant entries.
 *
 * Returns null if the application slug doesn't exist.
 */
export async function getTailoredResume(
  slug: string
): Promise<{ resume: Resume; application: ApplicationConfig } | null> {
  const [masterResume, application] = await Promise.all([
    getResume(),
    getApplication(slug),
  ]);

  if (!application) return null;

  // Filter experience by IDs, preserving the order from the application config
  const filteredExperience = application.experienceIds
    .map((id) => masterResume.experience.find((exp) => exp.id === id))
    .filter((exp): exp is NonNullable<typeof exp> => exp !== undefined);

  // Filter projects if specified, otherwise include all
  const filteredProjects = application.projectIds
    ? application.projectIds
        .map((id) => masterResume.projects?.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => p !== undefined)
    : masterResume.projects;

  // Filter education if specified, otherwise include all
  const filteredEducation = application.educationIds
    ? application.educationIds
        .map((id) => masterResume.education.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => e !== undefined)
    : masterResume.education;

  // Filter skills: hide categories, then highlight specific skills
  let filteredSkills = { ...masterResume.skills };

  if (application.hiddenSkillCategories) {
    for (const category of application.hiddenSkillCategories) {
      delete filteredSkills[category];
    }
  }

  if (application.highlightedSkills) {
    const highlighted = new Set(application.highlightedSkills);
    const newSkills: Record<string, string[]> = {};
    for (const [category, skills] of Object.entries(filteredSkills)) {
      const filtered = skills.filter((s) => highlighted.has(s));
      if (filtered.length > 0) {
        newSkills[category] = filtered;
      }
    }
    filteredSkills = newSkills;
  }

  const tailoredResume: Resume = {
    meta: {
      ...masterResume.meta,
      ...(application.customSummary
        ? { summary: application.customSummary }
        : {}),
    },
    experience: filteredExperience,
    skills: filteredSkills,
    education: filteredEducation,
    projects: filteredProjects,
    certifications: masterResume.certifications,
  };

  return { resume: tailoredResume, application };
}

import {
  ResumeSchema,
  ApplicationSchema,
  type Resume,
  type ApplicationConfig,
} from "./schema";

// Statically import the master resume
import resumeData from "@/data/resume.json";

// Statically import and register application configurations
// Whenever you add a new application JSON file under src/data/applications/,
// import it here and register its slug in the registry below.
import testCompanyConfig from "@/data/applications/test-company.json";

const applicationsRegistry: Record<string, unknown> = {
  "test-company": testCompanyConfig,
};

// ─── Resume ─────────────────────────────────────────────────────────────────

/**
 * Validates the statically imported master resume JSON.
 * Throws a ZodError if the data doesn't match the schema.
 */
export async function getResume(): Promise<Resume> {
  return ResumeSchema.parse(resumeData);
}

// ─── Applications ───────────────────────────────────────────────────────────

/**
 * Validates a single application config by slug from the static registry.
 * Returns null if the application slug doesn't exist.
 */
export async function getApplication(
  slug: string
): Promise<ApplicationConfig | null> {
  const rawConfig = applicationsRegistry[slug];
  if (!rawConfig) {
    return null;
  }
  try {
    return ApplicationSchema.parse(rawConfig);
  } catch (err) {
    // Zod validation error or other issue — re-throw
    throw err;
  }
}

/**
 * Lists all available application slugs from the static registry.
 */
export async function listApplicationSlugs(): Promise<string[]> {
  return Object.keys(applicationsRegistry);
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

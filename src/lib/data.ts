import {
  ResumeSchema,
  ApplicationSchema,
  RawResumeSchema,
  type Resume,
  type ApplicationConfig,
} from "./schema";

// Statically import the master resume
import resumeData from "@/data/resume.json";

// Import the auto-generated application registry
import { applicationsRegistry } from "./applications-registry";

/**
 * Resolves a privileged string configuration to either its string value
 * or undefined depending on whether the user is authorized.
 */
export function resolvePrivilegedString(
  val: any,
  isAuthorized: boolean
): string | undefined {
  if (val === undefined || val === null) {
    return undefined;
  }
  if (typeof val === "string") {
    return val;
  }
  if (typeof val === "object" && "value" in val) {
    if (val.privileged && !isAuthorized) {
      return undefined;
    }
    return val.value;
  }
  return undefined;
}

// ─── Resume ─────────────────────────────────────────────────────────────────

/**
 * Validates the statically imported master resume JSON, resolving privileged fields.
 * Throws a ZodError if the data doesn't match the schema.
 */
export async function getResume(isAuthorized = false): Promise<Resume> {
  const raw = RawResumeSchema.parse(resumeData);

  const resolvedMeta = {
    name: resolvePrivilegedString(raw.meta.name, isAuthorized)!,
    title: resolvePrivilegedString(raw.meta.title, isAuthorized)!,
    location: resolvePrivilegedString(raw.meta.location, isAuthorized)!,
    email: resolvePrivilegedString(raw.meta.email, isAuthorized)!,
    phone: resolvePrivilegedString(raw.meta.phone, isAuthorized),
    links: raw.meta.links,
    summary: resolvePrivilegedString(raw.meta.summary, isAuthorized)!,
  };

  return {
    ...raw,
    meta: resolvedMeta,
  };
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
    getResume(true),
    getApplication(slug),
  ]);

  if (!application) return null;

  // Filter experience by IDs, preserving the order from the application config
  const filteredExperience = application.experienceIds
    .map((id) => {
      const exp = masterResume.experience.find((exp) => exp.id === id);
      if (!exp) return undefined;
      const override = application.experienceOverrides?.[id];
      if (override) {
        return {
          ...exp,
          role: override.role ?? exp.role,
          highlights: override.highlights ?? exp.highlights,
          tags: override.tags ?? exp.tags,
        };
      }
      return exp;
    })
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

  // Start with the base skills from master resume or skillsOverrides
  let filteredSkills: Record<string, string[]>;
  if (application.skillsOverrides) {
    filteredSkills = {};
    for (const [cat, skills] of Object.entries(application.skillsOverrides)) {
      filteredSkills[cat] = [...skills];
    }
  } else {
    filteredSkills = { ...masterResume.skills };
  }

  // Remove hidden categories
  if (application.hiddenSkillCategories) {
    for (const category of application.hiddenSkillCategories) {
      delete filteredSkills[category];
    }
  }

  // Apply highlightedSkills logic
  if (application.highlightedSkills) {
    const highlightedSet = new Set(application.highlightedSkills);

    if (application.skillsOverrides) {
      const newSkills: Record<string, string[]> = {};
      for (const [category, skills] of Object.entries(filteredSkills)) {
        // Highlighted skills from the override, ordered by highlightedSkills
        const highlighted = application.highlightedSkills.filter((s) => skills.includes(s));

        // Remaining skills from the override that are not highlighted
        const remaining = skills.filter((s) => !highlightedSet.has(s));

        const combined = [...highlighted, ...remaining];
        if (combined.length > 0) {
          newSkills[category] = combined;
        }
      }
      filteredSkills = newSkills;
    } else {
      // Original fallback logic if skillsOverrides is not defined
      const newSkills: Record<string, string[]> = {};
      for (const [category, skills] of Object.entries(filteredSkills)) {
        const filtered = skills.filter((s) => highlightedSet.has(s));
        if (filtered.length > 0) {
          newSkills[category] = filtered;
        }
      }
      filteredSkills = newSkills;
    }
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

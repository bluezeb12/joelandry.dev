import { z } from "zod";

// ─── Master Resume Schema ────────────────────────────────────────────────────

const LinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  icon: z.string().optional(),
});

const MetaSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  links: z.array(LinkSchema),
  summary: z.string(),
});

const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  division: z.string().optional(),
  role: z.string(),
  type: z.enum(["full-time", "contract", "internship"]).default("full-time"),
  startDate: z.string(), // YYYY-MM
  endDate: z.string().nullable(), // null = "Present"
  location: z.string().optional(),
  highlights: z.array(z.string()),
  tags: z.array(z.string()),
});

const EducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  graduationDate: z.string(),
  coursework: z.array(z.string()).optional(),
});

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().url().optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  tags: z.array(z.string()),
});

export const ResumeSchema = z.object({
  meta: MetaSchema,
  experience: z.array(ExperienceSchema),
  skills: z.record(z.string(), z.array(z.string())),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema).optional(),
  projects: z.array(ProjectSchema).optional(),
});

// ─── Application Config Schema ──────────────────────────────────────────────

export const ApplicationSchema = z.object({
  slug: z.string(),
  companyName: z.string(),
  roleName: z.string(),
  customSummary: z.string().nullable().optional(),
  customIntro: z.string().nullable().optional(),
  experienceIds: z.array(z.string()),
  projectIds: z.array(z.string()).nullable().optional(),
  educationIds: z.array(z.string()).nullable().optional(),
  highlightedSkills: z.array(z.string()).nullable().optional(),
  hiddenSkillCategories: z.array(z.string()).nullable().optional(),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type Resume = z.infer<typeof ResumeSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type ApplicationConfig = z.infer<typeof ApplicationSchema>;

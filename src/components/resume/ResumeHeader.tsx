import type { Meta } from "@/lib/schema";
import {
  Mail,
  Phone,
  MapPin,
  Link,
  Code2,
  Globe,
  ExternalLink,
} from "lucide-react";

interface ResumeHeaderProps {
  meta: Meta;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Link,
  github: Code2,
  website: Globe,
  globe: Globe,
};

export function ResumeHeader({ meta }: ResumeHeaderProps) {
  return (
    <header>
      <h1 className="resume-name">{meta.name}</h1>
      <p className="resume-title">{meta.title}</p>

      <div className="contact-links">
        {meta.location && (
          <span className="contact-link">
            <MapPin />
            {meta.location}
          </span>
        )}
        <a href={`mailto:${meta.email}`} className="contact-link">
          <Mail />
          {meta.email}
        </a>
        {meta.phone && (
          <a href={`tel:${meta.phone}`} className="contact-link">
            <Phone />
            {meta.phone}
          </a>
        )}
        {meta.links.map((link) => {
          const IconComponent =
            iconMap[link.icon?.toLowerCase() ?? ""] ?? ExternalLink;
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              <IconComponent />
              {link.label}
            </a>
          );
        })}
      </div>

      <p className="resume-summary">{meta.summary}</p>
    </header>
  );
}

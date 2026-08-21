export interface Exp {
  id: string; company: string; title: string; location: string;
  startDate: string; endDate: string; current: boolean; bullets: string[];
}
export interface Edu {
  id: string; school: string; degree: string; field: string;
  startDate: string; endDate: string; gpa: string; honors: string;
}
export interface Cert {
  id: string; name: string; issuer: string; date: string; url: string;
}
export interface Proj {
  id: string; name: string; description: string; link: string; tech: string;
}
export interface Language {
  id: string; name: string; level: string;
}
export interface Award {
  id: string; title: string; issuer: string; date: string; description: string;
}
export interface Volunteer {
  id: string; org: string; role: string;
  startDate: string; endDate: string; current: boolean; description: string;
}
export interface Publication {
  id: string; title: string; publisher: string; date: string; url: string;
}

export type SectionKey =
  | "summary" | "experience" | "education" | "skills"
  | "certifications" | "projects" | "languages"
  | "awards" | "volunteer" | "publications";

export const ALL_SECTIONS: SectionKey[] = [
  "summary","experience","education","skills",
  "certifications","projects","languages","awards","volunteer","publications",
];

export interface ResumeData {
  name: string; title: string; email: string; phone: string;
  location: string; linkedin: string; website: string; github: string;
  photo: string;
  summary: string;
  experience: Exp[];
  education: Edu[];
  skills: string[];
  certifications: Cert[];
  projects: Proj[];
  languages: Language[];
  awards: Award[];
  volunteer: Volunteer[];
  publications: Publication[];
  sectionOrder: SectionKey[];
  sectionVisible: Record<SectionKey, boolean>;
}

export interface TemplateProps {
  data: ResumeData;
  color: string;
  font: string;
  spacing: number;
}

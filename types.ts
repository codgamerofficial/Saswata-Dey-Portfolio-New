
export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  type: 'Major' | 'Minor';
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  grade: string;
}

export interface PortfolioData {
  name: string;
  objective: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  hobbies: string[];
  github: string;
}

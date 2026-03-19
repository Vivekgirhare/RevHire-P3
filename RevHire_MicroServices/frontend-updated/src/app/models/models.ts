// src/app/models/models.ts

export interface User {
  userId: number;
  name: string;
  email: string;
  role: 'JOB_SEEKER' | 'EMPLOYER';
  token: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  requiredSkills: string;
  requiredEducation: string;
  minExperienceYears: number;
  maxExperienceYears: number;
  location: string;
  isRemote: boolean;
  minSalary: number;
  maxSalary: number;
  jobType: string;
  status: string;
  applicationDeadline: string;
  numberOfOpenings: number;
  postedAt: string;
  companyId: number;
  companyName: string;
  companyIndustry: string;
  companyLocation: string;
  applicationCount: number;
  alreadyApplied: boolean;
  saved: boolean;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLocation: string;
  coverLetter: string;
  status: string;
  employerNote: string;
  appliedAt: string;
  updatedAt: string;
  applicantId?: number;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantLocation?: string;
  resumeFileName?: string;
  totalExperienceYears?: number;
  currentJobTitle?: string;
  skills?: string;
  objective?: string;
  education?: string;
  experience?: string;
}

export interface Profile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  employmentStatus: string;
  profileId: number;
  objective: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
  totalExperienceYears: number;
  currentJobTitle: string;
  linkedinUrl: string;
  portfolioUrl: string;
  resumeFileName: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string;
  size: string;
  description: string;
  website: string;
  location: string;
  foundedYear: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  referenceId: number;
}

import type { LucideIcon } from "lucide-react";

export interface Review {
  id: number;
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
  createdAt?: string;
  report_count: number;
  reported?: boolean;
  teacherId?: number;
  teacherName?: string;
  subjectId?: number;
  subjectName?: string;
  // For potential future grouping
  subjectIds?: number[];
  subjectNames?: string[];
}

export interface Teacher {
  id: number;
  name: string;
  reviews: Review[];
  subject?: string; // Context-specific subject
  subjects?: Set<string>; // All subjects taught
  averageRating?: number;
}

export interface ClassInfo {
  id: number;
  discipline_name: string;
  number: string;
  preferential: boolean;
  times: string;
  teacher: string;
  offered_uerj: number;
  occupied_uerj: number;
  offered_vestibular: number;
  occupied_vestibular: number;
  request_uerj_offered: number;
  request_uerj_total: number;
  request_uerj_preferential: number;
  request_vestibular_offered: number;
  request_vestibular_total: number;
  request_vestibular_preferential: number;
  location?: string;
}


export interface Subject {
  id: number;
  name: string;
  iconName: string;
  teachers: Teacher[];
  classes?: ClassInfo[];
  period?: number;
}

export interface SubjectLink {
  subjectId: number;
  subjectName: string;
  linkUrl: string | null;
  iconName: string;
}

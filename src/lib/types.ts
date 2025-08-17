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

export interface Subject {
  id: number;
  name: string;
  iconName: string;
  teachers: Teacher[];
}

export interface SubjectLink {
  subjectId: number;
  subjectName: string;
  linkUrl: string | null;
  iconName: string;
}

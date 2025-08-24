
'use client';

import { useState, useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import CourseFlowchart from './course-flowchart';
import RecommendationSection from './recommendation-section';
import { Input } from './ui/input';
import { Search, BookOpen } from 'lucide-react';
import SubjectSection from './subject-section';
import { subjectToSemesterMap } from '@/lib/utils';


interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
  allTeachers: Teacher[];
}

export default function TeacherRateClient({ initialSubjectsData, allTeachers }: TeacherRateClientProps) {
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([]);
  
  return (
    <>
      <CourseFlowchart onCompletedChange={setCompletedSubjects} />
      <RecommendationSection allSubjects={initialSubjectsData || []} completedSubjects={completedSubjects} allTeachers={allTeachers} />
    </>
  );
}

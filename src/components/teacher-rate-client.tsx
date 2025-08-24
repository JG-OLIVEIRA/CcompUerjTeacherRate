
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
  const [searchQuery, setSearchQuery] = useState('');

  const groupedAndFilteredSubjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    const filtered = initialSubjectsData.filter(subject =>
      subject.name.toLowerCase().includes(lowercasedQuery)
    );

    const grouped: Record<string, Subject[]> = {};
    for (const subject of filtered) {
      // Normalize both names for comparison
      const subjectNameLower = subject.name.toLowerCase();
      const periodNumber = subjectToSemesterMap[subjectNameLower as keyof typeof subjectToSemesterMap];
      const periodKey = periodNumber ? `${periodNumber}º Período` : 'Outras';
      
      if (!grouped[periodKey]) {
        grouped[periodKey] = [];
      }
      grouped[periodKey].push(subject);
    }
    
    // Sort groups by period number
    return Object.entries(grouped).sort(([keyA], [keyB]) => {
      if (keyA === 'Outras') return 1;
      if (keyB === 'Outras') return -1;
      const numA = parseInt(keyA, 10);
      const numB = parseInt(keyB, 10);
      return numA - numB;
    });

  }, [initialSubjectsData, searchQuery]);

  
  return (
    <>
      <CourseFlowchart onCompletedChange={setCompletedSubjects} />
      <RecommendationSection allSubjects={initialSubjectsData || []} completedSubjects={completedSubjects} allTeachers={allTeachers} />

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Disciplinas Disponíveis</h2>
        </div>
         <div className="mb-6 max-w-lg mx-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Pesquisar por disciplina..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
        </div>

        <div className="space-y-8">
            {groupedAndFilteredSubjects.length > 0 ? (
                groupedAndFilteredSubjects.map(([period, subjects]) => (
                    <div key={period}>
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-primary/20">{period}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {subjects.map(subject => (
                            <SubjectSection key={subject.id} subject={subject} />
                        ))}
                    </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                    <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{searchQuery}".</h2>
                    <p className="mt-2">Tente um termo de busca diferente.</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
}

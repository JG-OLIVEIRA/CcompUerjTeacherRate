
'use client';

import { useState, useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import CourseFlowchart from './course-flowchart';
import RecommendationSection from './recommendation-section';
import { Input } from './ui/input';
import { Search, BookOpen } from 'lucide-react';
import SubjectSection from './subject-section';


interface TeacherRateClientProps {
  initialSubjectsData: Subject[];
  allTeachers: Teacher[];
}

export default function TeacherRateClient({ initialSubjectsData, allTeachers }: TeacherRateClientProps) {
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    if (!lowercasedQuery) {
        return initialSubjectsData;
    }
    return initialSubjectsData.filter(subject => 
        subject.name.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialSubjectsData, searchQuery]);

  const groupedSubjects = useMemo(() => {
    const groups: { [key: string]: Subject[] } = {};
    filteredSubjects.forEach(subject => {
        const semester = subject.period || 'Outras';
        if (!groups[semester]) {
            groups[semester] = [];
        }
        groups[semester].push(subject);
    });
     return Object.entries(groups).sort(([a], [b]) => {
        if (a === 'Outras') return 1;
        if (b === 'Outras') return -1;
        return parseInt(a) - parseInt(b);
    });
  }, [filteredSubjects]);


  return (
    <>
      <CourseFlowchart onCompletedChange={setCompletedSubjects} />
      <RecommendationSection allSubjects={initialSubjectsData || []} completedSubjects={completedSubjects} allTeachers={allTeachers} />

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Disciplinas Disponíveis
          </h2>
        </div>
        <div className="mb-8 max-w-lg mx-auto">
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

        {groupedSubjects.length > 0 ? (
            <div className="space-y-6">
                {groupedSubjects.map(([semester, subjects]) => (
                    <div key={semester}>
                        <h3 className="text-xl font-semibold mb-3 pl-2 border-l-4 border-primary">
                            {semester === 'Outras' ? 'Outras' : `${semester}º Período`}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map(subject => (
                                <SubjectSection key={subject.id} subject={subject} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="col-span-full text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{searchQuery}".</h2>
                <p className="mt-2">Tente um termo de busca diferente.</p>
            </div>
        )}
      </div>
    </>
  );
}

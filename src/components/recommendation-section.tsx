
'use client';

import { useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb, Star, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { prerequisites } from './course-flowchart';
import { cleanTeacherName } from '@/lib/utils';

interface RecommendationSectionProps {
  allSubjects: Subject[];
  completedSubjects: string[];
  allTeachers: Teacher[];
}

const firstSemesterSubjects = ["geometria analítica", "cálculo i", "álgebra", "matemática discreta", "fundamentos da computação"];


export default function RecommendationSection({ allSubjects, completedSubjects, allTeachers }: RecommendationSectionProps) {

  const hasCompletedFirstSemesterSubject = useMemo(() => {
    if (completedSubjects.length === 0) return false;
    const completedSet = new Set(completedSubjects);
    return firstSemesterSubjects.some(subject => completedSet.has(subject));
  }, [completedSubjects]);


  const recommendations = useMemo(() => {
    if (completedSubjects.length === 0) return [];

    const completedSet = new Set(completedSubjects);
    
    // Find all subjects that haven't been completed yet but have classes available.
    const futureSubjects = allSubjects.filter(s => 
        !completedSet.has(s.name.toLowerCase()) && s.classes && s.classes.length > 0
    );
    
    const teacherSuggestions: { 
        subjectName: string, 
        teacher: Teacher | { name: string, averageRating?: number }, 
        subjectId: number 
    }[] = [];

    const allTeachersMap = new Map(allTeachers.map(t => [t.name.toLowerCase(), t]));

    futureSubjects.forEach(subject => {
        const subjectPrereqs = prerequisites[subject.name.toLowerCase()] || [];
        const prereqsMet = subjectPrereqs.every(prereq => completedSet.has(prereq));

        if (prereqsMet) {
            // Find teachers for the available classes of this subject
            const teachersInClasses = new Set(subject.classes?.map(c => cleanTeacherName(c.teacher).toLowerCase()));
            const availableTeachers = Array.from(teachersInClasses)
                .map(name => allTeachersMap.get(name))
                .filter((t): t is Teacher => !!t);

            if (availableTeachers.length > 0) {
                // Find the best-rated teacher among those who are actually teaching
                const topTeacher = [...availableTeachers].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];
                
                if (topTeacher) {
                    teacherSuggestions.push({ 
                        subjectName: subject.name, 
                        teacher: topTeacher, 
                        subjectId: subject.id 
                    });
                }
            } else if (subject.classes && subject.classes.length > 0) {
                 // Case where class exists but teacher is not in our reviewed list (or is "A DEFINIR")
                 teacherSuggestions.push({
                     subjectName: subject.name,
                     teacher: { name: cleanTeacherName(subject.classes[0].teacher) || "A definir" },
                     subjectId: subject.id
                 })
            }
        }
    });

    return teacherSuggestions
        .sort((a,b) => (b.teacher.averageRating ?? 0) - (a.teacher.averageRating ?? 0))
        .slice(0, 5);

  }, [completedSubjects, allSubjects, allTeachers]);
  
  if (!hasCompletedFirstSemesterSubject) {
    return null;
  }

  const hasRecommendations = recommendations.length > 0;
  
  if (!hasRecommendations) {
     return (
        <Card className="mb-8 bg-secondary/50 border-primary/20">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    Sugestões de Matérias
                </CardTitle>
                <CardDescription>
                    Com base nas matérias que você cursou, aqui estão algumas sugestões para o seu próximo período.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-center text-muted-foreground text-sm py-4">
                    Parabéns, parece que você já cursou todas as matérias disponíveis ou não há professores bem avaliados nas próximas!
                </p>
            </CardContent>
        </Card>
     )
  }

  return (
    <Card className="mb-8 bg-secondary/50 border-primary/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <Lightbulb className="h-6 w-6 text-primary" />
                Sugestões para o Próximo Período
            </CardTitle>
            <CardDescription>
                Com base nas matérias que você cursou, aqui estão as sugestões de matérias com os professores mais bem avaliados que possuem turmas abertas.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {recommendations.map(({ subjectName, teacher, subjectId }) => (
                    <Link href={`/subjects/${subjectId}`} key={`${subjectId}-${teacher.name}`} className="p-3 border rounded-lg bg-background text-center shadow-sm hover:border-primary transition-colors hover:-translate-y-0.5 flex flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold truncate" title={subjectName}>{subjectName}</p>
                            <div className="text-xs text-muted-foreground mt-1 mb-2 space-y-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <Users className="h-3 w-3" />
                                    <span className="text-primary font-medium truncate">{teacher.name}</span>
                                </div>
                                {teacher.averageRating !== undefined && teacher.averageRating > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                                        {teacher.averageRating?.toFixed(1)} de Média
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}


'use client';

import { useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lightbulb, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { prerequisites } from './course-flowchart';

interface RecommendationSectionProps {
  allSubjects: Subject[];
  completedSubjects: string[];
  allTeachers: Teacher[];
}

export default function RecommendationSection({ allSubjects, completedSubjects, allTeachers }: RecommendationSectionProps) {

  const recommendations = useMemo(() => {
    if (completedSubjects.length === 0) return [];

    const completedSet = new Set(completedSubjects);
    
    // Find all subjects that haven't been completed yet.
    const futureSubjects = allSubjects.filter(s => !completedSet.has(s.name));
    
    const teacherSuggestions: { subjectName: string, teacher: Teacher, subjectId: number }[] = [];

    futureSubjects.forEach(subject => {
        const subjectPrereqs = prerequisites[subject.name] || [];
        const prereqsMet = subjectPrereqs.every(prereq => completedSet.has(prereq));

        if (prereqsMet) {
            const teachersForSubject = allTeachers.filter(teacher => teacher.subjects?.has(subject.name));

            if(teachersForSubject.length > 0) {
                const topTeacher = [...teachersForSubject].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];
                
                if(topTeacher && (topTeacher.averageRating ?? 0) > 0) {
                    teacherSuggestions.push({ subjectName: subject.name, teacher: topTeacher, subjectId: subject.id });
                }
            }
        }
    });

    return teacherSuggestions
        .sort((a,b) => (b.teacher.averageRating ?? 0) - (a.teacher.averageRating ?? 0))
        .slice(0, 5);

  }, [completedSubjects, allSubjects, allTeachers]);
  
  if (completedSubjects.length === 0) {
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
                Com base nas matérias que você cursou, aqui estão as sugestões de matérias com os professores mais bem avaliados.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {recommendations.map(({ subjectName, teacher, subjectId }) => (
                    <Link href={`/subjects/${subjectId}`} key={subjectId} className="p-3 border rounded-lg bg-background text-center shadow-sm hover:border-primary transition-colors hover:-translate-y-0.5 flex flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold truncate" title={subjectName}>{subjectName}</p>
                            <p className="text-xs text-muted-foreground mt-1 mb-2">
                                Sugestão: <span className="text-primary font-medium">Prof. {teacher.name}</span>
                            </p>
                        </div>
                        <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                            {teacher.averageRating?.toFixed(1)} de Média
                        </Badge>
                    </Link>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}


'use client';

import { useState, useMemo } from 'react';
import type { Subject, Teacher } from '@/lib/types';
import CourseFlowchart from './course-flowchart';
import RecommendationSection from './recommendation-section';
import { Input } from './ui/input';
import { Search, BookOpen } from 'lucide-react';
import SubjectSection from './subject-section';

// Mapeamento de disciplinas para períodos.
const subjectToSemesterMap: { [key: string]: number } = {
    "Geometria Analítica": 1, "Cálculo I": 1, "Álgebra": 1, "Matemática Discreta": 1, "Fundamentos da Computação": 1,
    "Álgebra Linear": 2, "Cálculo II": 2, "Cálculo das Probabilidades": 2, "Algoritmos e Est. de Dados I": 2, "Linguagem de Programação I": 2, "Física I": 2,
    "Português Instrumental": 3, "Cálculo III": 3, "Algoritmos e Est. de Dados II": 3, "Elementos de Lógica": 3, "Linguagem de Programação II": 3, "Teoria da Computação": 3,
    "Cálculo Numérico": 4, "Cálculo IV": 4, "Algoritmos em Grafos": 4, "Engenharia de Software": 4, "Arquitetura de Computadores I": 4, "Física II": 4,
    "Estruturas de Linguagens": 5, "Banco de Dados I": 5, "Otimização em Grafos": 5, "Análise e Proj. de Sistemas": 5, "Sistemas Operacionais I": 5, "Arquitetura de Computadores II": 5, "Eletiva Básica": 5,
    "Otimização Combinatória": 6, "Banco de Dados II": 6, "Interfaces Humano-Comp.": 6, "Eletiva I": 6, "Sistemas Operacionais II": 6, "Compiladores": 6,
    "Computação Gráfica": 7, "Inteligência Artificial": 7, "Ética Comp. e Sociedade": 7, "Metod. Cient. no Projeto Final": 7, "Redes de Computadores I": 7, "Arq. Avançadas de Computadores": 7,
    "Eletiva II": 8, "Eletiva III": 8, "Projeto Final": 8, "Sistemas Distribuídos": 8, "Eletiva IV": 8,
};

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
    const groups: { [key: number]: Subject[] } = {};
    filteredSubjects.forEach(subject => {
        const semester = subjectToSemesterMap[subject.name] || 9; // 9 para não categorizadas
        if (!groups[semester]) {
            groups[semester] = [];
        }
        groups[semester].push(subject);
    });
    return Object.entries(groups).sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [filteredSubjects]);


  return (
    <>
      <CourseFlowchart onCompletedChange={setCompletedSubjects} />
      <RecommendationSection allSubjects={initialSubjectsData || []} completedSubjects={completedSubjects} allTeachers={allTeachers} />

      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Todas as Matérias
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
                            {parseInt(semester) <= 8 ? `${semester}º Período` : 'Outras'}
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

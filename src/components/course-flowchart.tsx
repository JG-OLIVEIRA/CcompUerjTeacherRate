
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import FlowchartSubjectCard from "./flowchart-subject-card";
import { Lightbulb, MousePointerClick, CheckSquare, CalendarClock } from 'lucide-react';
import { Separator } from './ui/separator';

const flowchartData = [
    { semester: 1, subjects: ["Geometria Analítica", "Cálculo I", "Álgebra", "Matemática Discreta", "Fundamentos da Computação"] },
    { semester: 2, subjects: ["Álgebra Linear", "Cálculo II", "Cálculo das Probabilidades", "Algoritmos e Estruturas de Dados I", "Linguagem de Programação I", "Física I"] },
    { semester: 3, subjects: ["Português Instrumental", "Cálculo III", "Algoritmos e Estruturas de Dados II", "Elementos de Lógica", "Linguagem de Programação II", "Teoria da Computação"] },
    { semester: 4, subjects: ["Cálculo Numérico", "Cálculo IV", "Algoritmos em Grafos", "Engenharia de Software", "Arquitetura de Computadores I", "Física II"] },
    { semester: 5, subjects: ["Estruturas de Linguagens", "Banco de Dados I", "Otimização em Grafos", "Análise e Projeto de Sistemas", "Sistemas Operacionais I", "Arquitetura de Computadores II", "Eletiva Básica"] },
    { semester: 6, subjects: ["Otimização Combinatória", "Banco de Dados II", "Interfaces Humano-Computador", "Eletiva I", "Sistemas Operacionais II", "Compiladores"] },
    { semester: 7, subjects: ["Computação Gráfica", "Inteligência Artificial", "Ética Computacional e Sociedade", "Metodologia Científica no Projeto Final", "Redes de Computadores I", "Arquiteturas Avançadas de Computadores"] },
    { semester: 8, subjects: ["Eletiva II", "Eletiva III", "Projeto Final", "Sistemas Distribuídos", "Eletiva IV"] },
];

const totalSubjects = flowchartData.reduce((sum, semester) => sum + semester.subjects.length, 0);
const AVG_SUBJECTS_PER_SEMERTER = 6;


export const prerequisites: { [subject: string]: string[] } = {
    // 2nd Period
    "Álgebra Linear": ["Geometria Analítica", "Álgebra"],
    "Cálculo II": ["Cálculo I"],
    "Cálculo das Probabilidades": ["Álgebra", "Cálculo I"],
    "Algoritmos e Estruturas de Dados I": ["Matemática Discreta", "Fundamentos da Computação"],
    "Linguagem de Programação I": ["Fundamentos da Computação"],
    // 3rd Period
    "Cálculo III": ["Cálculo II"],
    "Algoritmos e Estruturas de Dados II": ["Algoritmos e Estruturas de Dados I"],
    "Elementos de Lógica": ["Algoritmos e Estruturas de Dados I"],
    "Linguagem de Programação II": ["Linguagem de Programação I"],
    "Teoria da Computação": ["Linguagem de Programação I"],
    // 4th Period
    "Cálculo Numérico": ["Álgebra Linear", "Cálculo II"],
    "Cálculo IV": ["Cálculo III"],
    "Algoritmos em Grafos": ["Algoritmos e Estruturas de Dados II"],
    "Engenharia de Software": ["Elementos de Lógica"],
    "Arquitetura de Computadores I": ["Linguagem de Programação II"],
    "Física II": ["Física I", "Teoria da Computação"],
    // 5th Period
    "Estruturas de Linguagens": ["Linguagem de Programação II"],
    "Banco de Dados I": ["Algoritmos em Grafos"],
    "Otimização em Grafos": ["Algoritmos em Grafos"],
    "Análise e Projeto de Sistemas": ["Engenharia de Software"],
    "Sistemas Operacionais I": ["Arquitetura de Computadores I"],
    "Arquitetura de Computadores II": ["Arquitetura de Computadores I"],
    // 6th Period
    "Otimização Combinatória": ["Eletiva Básica", "Otimização em Grafos"],
    "Banco de Dados II": ["Banco de Dados I"],
    "Interfaces Humano-Computador": ["Análise e Projeto de Sistemas"],
    "Sistemas Operacionais II": ["Sistemas Operacionais I"],
    "Compiladores": ["Estruturas de Linguagens", "Sistemas Operacionais I"],
    // 7th Period
    "Computação Gráfica": ["Otimização Combinatória"],
    "Inteligência Artificial": ["Banco de Dados II"],
    "Ética Computacional e Sociedade": ["Interfaces Humano-Computador"],
    "Redes de Computadores I": ["Sistemas Operacionais II"],
    "Arquiteturas Avançadas de Computadores": ["Sistemas Operacionais II", "Compiladores"],
    // 8th Period
    "Projeto Final": ["Metodologia Científica no Projeto Final"],
    "Sistemas Distribuídos": ["Redes de Computadores I"],
};


const LOCAL_STORAGE_KEY = 'completedSubjects';

interface CourseFlowchartProps {
  onCompletedChange: (completedSubjects: string[]) => void;
}

export default function CourseFlowchart({ onCompletedChange }: CourseFlowchartProps) {
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedCompleted = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedCompleted) {
        const parsedSubjects = JSON.parse(storedCompleted);
        const newCompleted = new Set<string>(parsedSubjects);
        setCompletedSubjects(newCompleted);
        onCompletedChange(Array.from(newCompleted));
      }
    } catch (error) {
      console.error("Failed to parse completed subjects from localStorage", error);
    }
  }, [onCompletedChange]);

  const handleToggleSubject = (subjectName: string) => {
    const newCompletedSubjects = new Set(completedSubjects);
    if (newCompletedSubjects.has(subjectName)) {
      newCompletedSubjects.delete(subjectName);
    } else {
      newCompletedSubjects.add(subjectName);
    }
    setCompletedSubjects(newCompletedSubjects);
    const completedArray = Array.from(newCompletedSubjects);
    onCompletedChange(completedArray);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completedArray));
    } catch (error) {
       console.error("Failed to save completed subjects to localStorage", error);
    }
  };

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return null;
  }
  
  const remainingSubjects = totalSubjects - completedSubjects.size;
  const remainingSemesters = Math.ceil(remainingSubjects / AVG_SUBJECTS_PER_SEMERTER);

  return (
    <Card className="w-full mb-6 bg-secondary/50 border-primary/20">
      <CardHeader>
        <div className='grid gap-4 sm:grid-cols-2'>
            <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    Fluxograma Interativo
                </CardTitle>
                <CardDescription className="flex items-start gap-2 mt-2">
                    <MousePointerClick className='h-4 w-4 mt-0.5 flex-shrink-0'/>
                    <span>Clique nas matérias que você já cursou para ver recomendações.</span>
                </CardDescription>
            </div>
            <div className='bg-background/70 border rounded-lg p-3 text-sm space-y-2'>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                         <CheckSquare className='h-4 w-4 text-primary' />
                        <span className='font-medium'>Matérias Restantes:</span>
                    </div>
                    <span className='font-bold text-base'>{remainingSubjects}</span>
                </div>
                 <Separator/>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                        <CalendarClock className='h-4 w-4 text-primary' />
                        <span className='font-medium'>Previsão de Formatura:</span>
                    </div>
                     <span className='font-bold text-base'>{remainingSemesters} {remainingSemesters === 1 ? 'período' : 'períodos'}</span>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {flowchartData.map(({ semester, subjects }) => (
              <div key={semester} className="flex flex-col items-center space-y-3">
                <h3 className="font-bold text-lg px-2 py-1 rounded w-full text-center bg-background border-b-2 border-primary/50">{semester}º Período</h3>
                <div className="flex flex-col space-y-2 w-full">
                  {subjects.map((subject) => (
                    <FlowchartSubjectCard 
                        key={subject} 
                        subjectName={subject}
                        isCompleted={completedSubjects.has(subject)}
                        onClick={() => handleToggleSubject(subject)} 
                        className="w-full"
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

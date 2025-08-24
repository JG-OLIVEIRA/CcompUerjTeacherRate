
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import FlowchartSubjectCard from "./flowchart-subject-card";
import { Lightbulb, MousePointerClick, CheckSquare, CalendarClock } from 'lucide-react';
import { Separator } from './ui/separator';

const flowchartData = [
    { semester: 1, subjects: ["geometria analítica", "cálculo i", "álgebra", "matemática discreta", "fundamentos da computação"] },
    { semester: 2, subjects: ["álgebra linear", "cálculo ii", "cálculo das probabilidades", "algoritmos e estruturas de dados i", "linguagem de programação i", "física i"] },
    { semester: 3, subjects: ["português instrumental", "cálculo iii", "algoritmos e estruturas de dados ii", "elementos de lógica", "linguagem de programação ii", "teoria da computação"] },
    { semester: 4, subjects: ["cálculo numérico", "cálculo iv", "algoritmos em grafos", "engenharia de software", "arquitetura de computadores i", "física ii"] },
    { semester: 5, subjects: ["estruturas de linguagens", "banco de dados i", "otimização em grafos", "análise e projeto de sistemas", "sistemas operacionais i", "arquitetura de computadores ii", "eletiva básica"] },
    { semester: 6, subjects: ["otimização combinatória", "banco de dados ii", "interfaces humano-computador", "eletiva i", "sistemas operacionais ii", "compiladores"] },
    { semester: 7, subjects: ["computação gráfica", "inteligência artificial", "ética, computadores e sociedade", "metodologia científica no projeto final", "redes de computadores i", "arquiteturas avançadas de computadores"] },
    { semester: 8, subjects: ["eletiva ii", "eletiva iii", "projeto final", "sistemas distribuídos", "eletiva iv"] },
];

const totalSubjects = flowchartData.reduce((sum, semester) => sum + semester.subjects.length, 0);
const AVG_SUBJECTS_PER_SEMERTER = 6;


export const prerequisites: { [subject: string]: string[] } = {
    // 2nd Period
    "álgebra linear": ["geometria analítica", "álgebra"],
    "cálculo ii": ["cálculo i"],
    "cálculo das probabilidades": ["álgebra", "cálculo i"],
    "algoritmos e estruturas de dados i": ["matemática discreta", "fundamentos da computação"],
    "linguagem de programação i": ["fundamentos da computação"],
    // 3rd Period
    "cálculo iii": ["cálculo ii"],
    "algoritmos e estruturas de dados ii": ["algoritmos e estruturas de dados i"],
    "elementos de lógica": ["algoritmos e estruturas de dados i"],
    "linguagem de programação ii": ["linguagem de programação i"],
    "teoria da computação": ["linguagem de programação i"],
    // 4th Period
    "cálculo numérico": ["álgebra linear", "cálculo ii"],
    "cálculo iv": ["cálculo iii"],
    "algoritmos em grafos": ["algoritmos e estruturas de dados ii"],
    "engenharia de software": ["elementos de lógica"],
    "arquitetura de computadores i": ["linguagem de programação ii"],
    "física ii": ["física i", "teoria da computação"],
    // 5th Period
    "estruturas de linguagens": ["linguagem de programação ii"],
    "banco de dados i": ["algoritmos em grafos"],
    "otimização em grafos": ["algoritmos em grafos"],
    "análise e projeto de sistemas": ["engenharia de software"],
    "sistemas operacionais i": ["arquitetura de computadores i"],
    "arquitetura de computadores ii": ["arquitetura de computadores i"],
    // 6th Period
    "otimização combinatória": ["eletiva básica", "otimização em grafos"],
    "banco de dados ii": ["banco de dados i"],
    "interfaces humano-computador": ["análise e projeto de sistemas"],
    "sistemas operacionais ii": ["sistemas operacionais i"],
    "compiladores": ["estruturas de linguagens", "sistemas operacionais i"],
    // 7th Period
    "computação gráfica": ["otimização combinatória"],
    "inteligência artificial": ["banco de dados ii"],
    "ética, computadores e sociedade": ["interfaces humano-computador"],
    "metodologia científica no projeto final": [],
    "redes de computadores i": ["sistemas operacionais ii"],
    "arquiteturas avançadas de computadores": ["sistemas operacionais ii", "compiladores"],
    // 8th Period
    "projeto final": ["metodologia científica no projeto final"],
    "sistemas distribuídos": ["redes de computadores i"],
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
  
  const getGraduationForecast = (): string => {
    if (remainingSemesters <= 0) return "Concluído!";
    
    const now = new Date();
    let year = now.getFullYear();
    // UERJ semester 1 is Jan-Jul (months 0-6), semester 2 is Aug-Dec (months 7-11)
    let semester = now.getMonth() < 7 ? 1 : 2;

    for (let i = 0; i < remainingSemesters; i++) {
        if (semester === 1) {
            semester = 2;
        } else {
            semester = 1;
            year += 1;
        }
    }
    
    return `${year}.${semester}`;
  };

  const graduationForecast = getGraduationForecast();

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
                     <span className='font-bold text-base'>{graduationForecast}</span>
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

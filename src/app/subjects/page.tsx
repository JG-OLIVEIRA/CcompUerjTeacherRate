

import { getSubjects, getTeachersWithGlobalStats } from '@/lib/data-service';
import TeacherRateClient from '@/components/teacher-rate-client';
import MainLayout from '@/components/main-layout';
import SubjectsHeaderActions from '@/components/subjects-header-actions';
import { Suspense } from 'react';
import type { Subject, Teacher } from '@/lib/types';


interface WrapperProps {
    subjectsData: Subject[];
    allTeachers: Teacher[];
}

function TeacherRateClientWrapper({ subjectsData, allTeachers }: WrapperProps) {
    return (
        <Suspense fallback={<div>Carregando cliente...</div>}>
            <TeacherRateClient 
                initialSubjectsData={subjectsData} 
                allTeachers={allTeachers} 
            />
        </Suspense>
    );
}


export default async function SubjectsPage() {
  const [subjectsData, allTeachers] = await Promise.all([
    getSubjects(),
    getTeachersWithGlobalStats()
  ]);

  const headerContent = (
    <div className="flex flex-col items-center justify-center text-center w-full">
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            O lugar central para encontrar e avaliar os professores de Ciência da Computação da UERJ.
        </p>
        <SubjectsHeaderActions />
    </div>
  );

  return (
    <MainLayout headerProps={{
        pageTitle: 'CcompUerjTeacherRate',
        pageIconName: 'GraduationCap',
        children: headerContent
    }}>
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <TeacherRateClientWrapper 
                subjectsData={subjectsData} 
                allTeachers={allTeachers}
            />
            
            <footer className="text-center mt-16 pb-8">
                <p className="text-sm text-muted-foreground">
                    Desenvolvido com a ajuda da IA do Firebase.
                </p>
            </footer>
        </div>
    </MainLayout>
  );
}

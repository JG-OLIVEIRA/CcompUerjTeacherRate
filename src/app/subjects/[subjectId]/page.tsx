

import { getSubjectById, getTeachersWithGlobalStats } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Users, GraduationCap } from 'lucide-react';
import TeacherCard from '@/components/teacher-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Teacher, Review } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import ClassInfoCard from '@/components/class-info-card';
import type { IconName } from '@/components/header';
import { cleanTeacherName } from '@/lib/utils';


interface SubjectProfilePageProps {
  params: {
    subjectId: string;
  };
}

// Função corrigida para calcular a média de avaliação
const calculateAverageRating = (reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const validReviews = reviews.filter(review => typeof review.rating === 'number' && !isNaN(review.rating));
    if (validReviews.length === 0) return 0;
    const total = validReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return total / validReviews.length;
};


// Helper function to find matching teachers for a class.
// It prioritizes the class teacher name as the source of truth.
const findMatchingTeachers = (className: string, allTeachers: Teacher[]): Teacher[] => {
    if (!className) return [];

    const cleanedClassName = cleanTeacherName(className).toLowerCase();
    const foundTeachers: Teacher[] = [];

    // Iterate through all evaluated teachers to see if their name is a part of the official class name.
    for (const teacher of allTeachers) {
        if (cleanedClassName.includes(teacher.name.toLowerCase())) {
            foundTeachers.push(teacher);
        }
    }

    // A heuristic to avoid adding sub-names (e.g., adding "LUERBIO" if "LUERBIO FARIA" is already found)
    if (foundTeachers.length > 1) {
        // Sort by name length descending to process longer names first
        const sortedByLength = [...foundTeachers].sort((a, b) => b.name.length - a.name.length);
        const uniqueTeachers = new Set<Teacher>();
        let coveredNames = "";

        for (const teacher of sortedByLength) {
            if (!coveredNames.includes(teacher.name.toLowerCase())) {
                uniqueTeachers.add(teacher);
                coveredNames += teacher.name.toLowerCase() + " "; // Add space to avoid partial matching issues
            }
        }
        return Array.from(uniqueTeachers);
    }
    
    // Fallback for direct match if no substring matches are found (e.g., class name is just "Luerbio")
    if(foundTeachers.length === 0) {
        const directMatch = allTeachers.find(t => t.name.toLowerCase() === cleanedClassName);
        if (directMatch) {
            return [directMatch];
        }
    }

    return foundTeachers;
};


// Componente de página com a tipagem corrigida
export default async function SubjectProfilePage({ params }: SubjectProfilePageProps) {
  const subjectId = parseInt(params.subjectId, 10);
  if (isNaN(subjectId)) {
    notFound();
  }

  // Fetch subject data and all teachers in parallel for efficiency
  const [subjectData, allTeachers] = await Promise.all([
    getSubjectById(subjectId),
    getTeachersWithGlobalStats() // Fetch all teachers to link even those without reviews for this subject
  ]);


  if (!subjectData) {
    notFound();
  }

  const teachersMap: Map<number, Teacher> = new Map();
  subjectData.reviews.forEach(review => {
      let teacher = teachersMap.get(review.teacher_id);
      if (!teacher) {
          teacher = {
              id: review.teacher_id,
              name: review.teacher_name,
              reviews: [],
              subject: subjectData.name
          };
          teachersMap.set(review.teacher_id, teacher);
      }
      teacher.reviews.push({
          id: review.review_id,
          text: review.review_text,
          rating: review.review_rating,
          upvotes: review.review_upvotes,
          downvotes: review.review_downvotes,
          createdAt: review.review_created_at,
          report_count: review.report_count,
      });
  });

  const evaluatedTeachersForSubject = Array.from(teachersMap.values()).map(teacher => ({
      ...teacher,
      averageRating: calculateAverageRating(teacher.reviews)
  })).sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

  const topTeacherId = evaluatedTeachersForSubject.length > 0 ? evaluatedTeachersForSubject[0].id : null;
  

  const headerContent = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground mb-4">
        <Button asChild variant="outline">
            <Link href="/subjects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Matérias
            </Link>
        </Button>
      </div>
       <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Início</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
                <Link href="/subjects">Matérias</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{subjectData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );

  return (
    <MainLayout headerProps={{
      pageTitle: subjectData.name,
      pageIconName: subjectData.iconName as IconName,
      children: headerContent
    }}>
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                 <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-3">
                    <Users className="h-7 w-7 text-primary" />
                    Professores Avaliados
                </h2>
                 {evaluatedTeachersForSubject.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {evaluatedTeachersForSubject.map((teacher) => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                isTopTeacher={teacher.id === topTeacherId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                        <p className="font-semibold">Nenhum professor encontrado.</p>
                        <p className="text-sm mt-2">Ainda não há professores avaliados para esta matéria.</p>
                    </div>
                )}

                {subjectData.classes && subjectData.classes.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-3">
                            <GraduationCap className="h-7 w-7 text-primary" />
                            Turmas Disponíveis
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {subjectData.classes.map(classInfo => {
                                const teachers = findMatchingTeachers(classInfo.teacher, allTeachers);
                                return (
                                    <ClassInfoCard 
                                        key={classInfo.id} 
                                        classInfo={classInfo}
                                        teacher={teachers.length > 1 ? teachers : teachers[0]}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

            </div>
        </div>
    </MainLayout>
  );
}

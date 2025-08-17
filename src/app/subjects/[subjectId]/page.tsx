
import { getSubjectById } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

// Componente de página com a tipagem corrigida
export default async function SubjectProfilePage({ params }: SubjectProfilePageProps) {
  const subjectId = parseInt(params.subjectId, 10);
  if (isNaN(subjectId)) {
    notFound();
  }

  const subjectData = await getSubjectById(subjectId);

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

  const teachers = Array.from(teachersMap.values()).map(teacher => ({
      ...teacher,
      averageRating: calculateAverageRating(teacher.reviews)
  })).sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

  const topTeacherId = teachers.length > 0 ? teachers[0].id : null;

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
      pageIconName: subjectData.iconName as any,
      children: headerContent
    }}>
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                 {teachers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {teachers.map((teacher) => (
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
            </div>
        </div>
    </MainLayout>
  );
}

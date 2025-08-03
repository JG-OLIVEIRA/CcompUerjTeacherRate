
import { getTeacherById } from '@/lib/data-service';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, BookOpen, User, ShieldAlert } from 'lucide-react';
import StarRating from '@/components/star-rating';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ViewReviewsDialog } from '@/components/view-reviews-dialog';
import { handleAddTeacherOrReview } from '@/app/actions';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function TeacherProfilePage({ params }: { params: { teacherId: string } }) {
  const teacherId = parseInt(params.teacherId, 10);
  if (isNaN(teacherId)) {
    notFound();
  }

  const teacher = await getTeacherById(teacherId);

  if (!teacher) {
    notFound();
  }

  const allSubjectNames = Array.from(teacher.subjects || []).sort();

  const headerContent = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <User className="h-5 w-5" />
        <span>Página do Professor</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground mb-4">
        <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a Lista
            </Link>
        </Button>
         <Button asChild variant="destructive">
            <Link href={`/solicitacao?professor=${encodeURIComponent(teacher.name)}`}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Professor, envie uma solicitação
            </Link>
        </Button>
      </div>
    </div>
  );

  const sortedReviews = (teacher.reviews || []).sort((a, b) => {
    const voteBalanceA = (a.upvotes || 0) - (a.downvotes || 0);
    const voteBalanceB = (b.upvotes || 0) - (b.downvotes || 0);
     if (voteBalanceB !== voteBalanceA) {
      return voteBalanceB - voteBalanceA;
    }
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <MainLayout headerProps={{
      pageTitle: teacher.name,
      pageIconName: 'UserCircle',
      children: headerContent
    }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mt-2">
                                    <StarRating rating={teacher.averageRating ?? 0} />
                                    <span className="font-bold text-lg text-muted-foreground">
                                        {(teacher.averageRating ?? 0).toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {teacher.reviews.length} {teacher.reviews.length === 1 ? 'avaliação' : 'avaliações'}
                                </p>
                            </div>
                        </div>
                        <AddTeacherOrReviewDialog
                            allSubjectNames={allSubjectNames}
                            allTeachers={[teacher]}
                            onSubmit={handleAddTeacherOrReview}
                            initialTeacherName={teacher.name}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-4">
                        <h3 className="text-md font-semibold flex items-center gap-2 mb-2">
                            <BookOpen className="h-5 w-5 text-primary"/>
                            Matérias Lecionadas
                        </h3>
                        {teacher.subjects && teacher.subjects.size > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {Array.from(teacher.subjects).sort().map(subject => (
                                    <Badge key={subject} variant="secondary">{subject}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma matéria registrada para este professor.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-8" />
            
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6 flex items-center gap-3">
                    <MessageSquare className="h-7 w-7 text-primary" />
                    Avaliações dos Alunos
                </h2>
                 {sortedReviews.length > 0 ? (
                     <div className="space-y-4">
                        {sortedReviews.slice(0, 5).map(review => (
                            <div key={review.id} className="p-4 border rounded-lg bg-background/50">
                                <div className="flex justify-between items-center mb-2">
                                    <StarRating rating={review.rating} />
                                    <Badge variant="outline">{review.subjectName}</Badge>
                                </div>
                                {review.text && review.text.trim() !== '' ? (
                                    <blockquote className="text-sm text-foreground italic border-l-4 pl-4 my-3">
                                        {review.text}
                                    </blockquote>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic my-3">O aluno não deixou um comentário escrito.</p>
                                )}
                                <div className="flex justify-end items-center text-xs text-muted-foreground">
                                    <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('pt-BR') : ''}</span>
                                </div>
                            </div>
                        ))}
                        {sortedReviews.length > 5 && (
                             <ViewReviewsDialog teacher={teacher} disabled={false}>
                                <Button variant="outline" className="w-full mt-6">Ver todas as {sortedReviews.length} avaliações</Button>
                            </ViewReviewsDialog>
                        )}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                        <p className="font-semibold">Nenhuma avaliação ainda.</p>
                        <p className="text-sm mt-2">Seja o primeiro a avaliar {teacher.name}!</p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </MainLayout>
  );
}

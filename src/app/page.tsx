
import { BookOpen, Megaphone, ShieldCheck, MessageSquareQuote, Info } from 'lucide-react';
import Link from 'next/link';
import { getTeachersWithGlobalStats, getRecentReviews, getPlatformStats, getAllSubjectNames } from '@/lib/data-service';
import { Button } from '@/components/ui/button';
import { AddTeacherOrReviewDialog } from '@/components/add-teacher-or-review-dialog';
import { handleAddTeacherOrReview } from './actions';
import TeacherListClient from '@/components/teacher-list-client';
import MainLayout from '@/components/main-layout';
import WelcomeReviewHandler from '@/components/welcome-review-handler';
import RecentReviews from '@/components/recent-reviews';
import { Separator } from '@/components/ui/separator';
import StatsCards from '@/components/stats-cards';
import type { Teacher } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  // Fetch all data in parallel
  const [teachers, recentReviews, stats, allSubjectNames] = await Promise.all([
    getTeachersWithGlobalStats(),
    getRecentReviews(),
    getPlatformStats(),
    getAllSubjectNames(),
  ]);
  
  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name));

  const headerContent = (
      <div className="flex flex-col items-center justify-center text-center w-full px-4 space-y-6">
        <p className="text-lg text-muted-foreground max-w-3xl">
          O lugar central para encontrar e avaliar os professores de Ciência da Computação da UERJ.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AddTeacherOrReviewDialog
                allSubjectNames={allSubjectNames}
                allTeachers={teachers} // Pass the full teacher objects
                onSubmit={handleAddTeacherOrReview}
            />
            <Button asChild variant="outline">
                <Link href="/subjects">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver por Matéria
                </Link>
            </Button>
        </div>

        <Alert className="w-full max-w-3xl text-left border-primary/50 bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary/90">Aviso Importante</AlertTitle>
          <AlertDescription className="text-primary/80">
            Este site foi criado para te auxiliar durante o período de inscrição em disciplinas, mas continuará no ar para consulta até o fim da SAID (Alteração de Inscrição em Disciplinas). Aproveite!
          </AlertDescription>
        </Alert>

        <div className="w-full max-w-3xl p-4 bg-secondary/50 border border-primary/20 rounded-lg text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
                <Megaphone className="h-5 w-5 text-primary"/>
                <h3 className="text-md font-semibold text-foreground">Nosso Compromisso</h3>
            </div>
            <p className="text-sm text-muted-foreground px-2">
                Este espaço foi criado para feedback construtivo. Lembre-se de ser respeitoso em suas avaliações, focando na didática e na sua experiência de aprendizado. O objetivo é ajudar alunos e professores a crescerem juntos.
            </p>
             <Button asChild variant="link" size="sm" className="text-primary text-center h-auto whitespace-normal">
              <Link href="/moderation">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Acessar o Painel de Moderação Comunitária
              </Link>
            </Button>
        </div>
      </div>
  );

  return (
    <MainLayout headerProps={{
      pageTitle: 'CcompUerjTeacherRate',
      pageIconName: 'GraduationCap',
      children: headerContent
    }}>
      <WelcomeReviewHandler 
        teachers={teachers}
        onSubmit={handleAddTeacherOrReview}
      />
      <div className="container mx-auto px-4 py-8">
        
        <StatsCards stats={stats} />

        {recentReviews.length > 0 && (
          <>
            <Separator className="my-12"/>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquareQuote className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Últimas Avaliações
                </h2>
              </div>
              <RecentReviews initialReviews={recentReviews} />
            </div>
          </>
        )}
        
        <Separator className="my-12"/>

        <TeacherListClient 
          initialTeachers={sortedTeachers} 
        />

        <footer className="text-center mt-16 pb-8 space-y-2">
            <p className="text-sm text-muted-foreground">
                Desenvolvido com a ajuda da IA do Firebase.
            </p>
        </footer>
      </div>
    </MainLayout>
  );
}

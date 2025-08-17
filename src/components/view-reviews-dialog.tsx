
"use client"

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { Teacher } from '@/lib/types';
import StarRating from './star-rating';
import { ScrollArea } from './ui/scroll-area';
import { Button, buttonVariants } from './ui/button';
import { ThumbsUp, ThumbsDown, Flag, ShieldAlert, MessageSquare } from 'lucide-react';
import { upvoteReview, downvoteReview, reportReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const REPORTED_REVIEWS_KEY = 'reportedReviews';
const VOTED_REVIEWS_DIALOG_KEY = 'votedReviewsDialog';


interface ViewReviewsDialogProps {
    teacher: Teacher;
    children: React.ReactNode;
    disabled: boolean;
}

export function ViewReviewsDialog({ teacher, children, disabled }: ViewReviewsDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [reportedIds, setReportedIds] = useState<number[]>([]);
    const [votedIds, setVotedIds] = useState<number[]>([]);


    useEffect(() => {
        try {
            const storedReported = localStorage.getItem(REPORTED_REVIEWS_KEY);
            if (storedReported) setReportedIds(JSON.parse(storedReported));
            
            const storedVoted = localStorage.getItem(VOTED_REVIEWS_DIALOG_KEY);
            if (storedVoted) setVotedIds(JSON.parse(storedVoted));
        } catch (error) {
            console.error("Failed to parse from localStorage", error);
        }
    }, []);

    const addIdToLocalStorage = (key: string, currentIds: number[], newId: number) => {
        const newIdList = [...currentIds, newId];
        try {
            localStorage.setItem(key, JSON.stringify(newIdList));
        } catch (error) {
             console.error(`Failed to save to localStorage key ${key}:`, error);
        }
        return newIdList;
    };


    if (disabled) {
        return <div className="w-full">{children}</div>;
    }
    
    const handleVote = (reviewId: number, voteType: 'up' | 'down') => {
        if (votedIds.includes(reviewId)) {
            toast({ variant: "destructive", title: "Voto já registrado" });
            return;
        }

        startTransition(async () => {
            try {
                const action = voteType === 'up' ? upvoteReview : downvoteReview;
                await action(reviewId);
                setVotedIds(addIdToLocalStorage(VOTED_REVIEWS_DIALOG_KEY, votedIds, reviewId));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
                toast({
                    variant: "destructive",
                    title: "Erro ao votar",
                    description: errorMessage,
                });
            }
        });
    };

    const handleReport = (reviewId: number) => {
        if (reportedIds.includes(reviewId)) {
            toast({
                variant: "destructive",
                title: "Denúncia já registrada",
                description: "Você já denunciou esta avaliação nesta sessão.",
            });
            return;
        }

        startTransition(async () => {
            try {
                await reportReview(reviewId);
                setReportedIds(addIdToLocalStorage(REPORTED_REVIEWS_KEY, reportedIds, reviewId));
                toast({
                    title: "Avaliação denunciada",
                    description: "Obrigado. Nossa equipe irá analisar a sua denúncia.",
                });
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
                toast({
                    variant: "destructive",
                    title: "Erro ao denunciar",
                    description: errorMessage,
                });
            }
        })
    }

    // Sort all reviews: reviews with text and higher vote count first
    const sortedReviews = [...teacher.reviews].sort((a, b) => {
        const aHasText = a.text && a.text.trim() !== '';
        const bHasText = b.text && b.text.trim() !== '';

        if (aHasText && !bHasText) return -1;
        if (!aHasText && bHasText) return 1;

        const voteBalanceA = (a.upvotes || 0) - (a.downvotes || 0);
        const voteBalanceB = (b.upvotes || 0) - (b.downvotes || 0);
        if (voteBalanceB !== voteBalanceA) {
            return voteBalanceB - voteBalanceA;
        }

        // Fallback to sorting by date if vote balance is the same
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Data inválida";
            }
            return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
        } catch (e) {
            return "Data inválida";
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Avaliações para {teacher.name}</DialogTitle>
                    <DialogDescription>
                        Veja o que os outros alunos estão dizendo. As avaliações mais relevantes aparecem primeiro.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {sortedReviews.length > 0 ? sortedReviews.map((review) => {
                            const isAlreadyReported = reportedIds.includes(review.id);
                            const hasVoted = votedIds.includes(review.id);
                            const hasText = review.text && review.text.trim() !== '';
                            return (
                            <div key={review.id} className="p-4 border rounded-lg bg-background/50">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <StarRating rating={review.rating} />
                                        <div className="flex flex-wrap gap-1">
                                            {review.subjectName && (
                                                <Badge variant="outline">{review.subjectName}</Badge>
                                            )}
                                        </div>
                                    </div>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isPending || isAlreadyReported}
                                                aria-label="Denunciar avaliação"
                                                title={isAlreadyReported ? "Você já denunciou esta avaliação" : "Denunciar avaliação"}
                                            >
                                                <Flag className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2">
                                                    <ShieldAlert className="h-6 w-6 text-destructive"/>
                                                    Denunciar esta avaliação?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. A avaliação será ocultada e revisada. Se receber múltiplas denúncias, será permanentemente excluída. Por favor, denuncie apenas conteúdo que viole as regras (ex: discurso de ódio, ataques pessoais, spam).
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    className={cn(buttonVariants({variant: "destructive"}))}
                                                    onClick={() => handleReport(review.id)}>
                                                    Confirmar Denúncia
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                {hasText ? (
                                    <p className="text-sm text-foreground mb-3">{review.text}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic mb-3">O aluno não deixou um comentário escrito.</p>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-7 w-7"
                                                onClick={() => handleVote(review.id, 'up')}
                                                disabled={isPending || hasVoted}
                                            >
                                                <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xs font-medium text-muted-foreground w-4">{review.upvotes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-7 w-7"
                                                onClick={() => handleVote(review.id, 'down')}
                                                disabled={isPending || hasVoted}
                                            >
                                                <ThumbsDown className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xs font-medium text-muted-foreground w-4">{review.downvotes}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(review.createdAt || '')}
                                    </span>
                                </div>
                            </div>
                        )}) : (
                            <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                                <MessageSquare className="h-10 w-10 text-primary/80"/>
                                <p className="font-semibold">Nenhuma avaliação encontrada.</p>
                                <p className="text-sm">Ainda não há nenhuma avaliação para este professor.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

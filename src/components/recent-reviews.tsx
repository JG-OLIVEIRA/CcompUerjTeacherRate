
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, Quote, User, Book } from 'lucide-react';
import StarRating from './star-rating';
import { upvoteReview, downvoteReview } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import Autoplay from "embla-carousel-autoplay"


interface RecentReviewsProps {
  initialReviews: Review[];
}

const VOTED_REVIEWS_KEY_RECENT = 'votedReviewsRecent';

export default function RecentReviews({ initialReviews }: RecentReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();
  const [votedReviewIds, setVotedReviewIds] = useState<number[]>([]);
  const { toast } = useToast();

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  )

  useEffect(() => {
    try {
      const voted = localStorage.getItem(VOTED_REVIEWS_KEY_RECENT);
      if (voted) {
        setVotedReviewIds(JSON.parse(voted));
      }
    } catch (error) {
      console.error("Failed to parse voted reviews from localStorage", error);
    }
  }, []);

  const addVotedReviewId = (reviewId: number) => {
    const newVotedIds = [...votedReviewIds, reviewId];
    setVotedReviewIds(newVotedIds);
    try {
      localStorage.setItem(VOTED_REVIEWS_KEY_RECENT, JSON.stringify(newVotedIds));
    } catch (error) {
      console.error("Failed to save voted review to localStorage", error);
    }
  };

  const handleVote = (reviewId: number, voteType: 'up' | 'down') => {
    if (votedReviewIds.includes(reviewId)) {
        toast({
            variant: 'destructive',
            title: 'Voto já registrado',
            description: 'Você já votou nesta avaliação.',
        });
        return;
    }

    startTransition(async () => {
      try {
        const action = voteType === 'up' ? upvoteReview : downvoteReview;
        await action(reviewId);
        addVotedReviewId(reviewId);

        setReviews(prevReviews => 
          prevReviews.map(review => {
            if (review.id === reviewId) {
              return {
                ...review,
                upvotes: voteType === 'up' ? review.upvotes + 1 : review.upvotes,
                downvotes: voteType === 'down' ? review.downvotes + 1 : review.downvotes,
              };
            }
            return review;
          })
        );

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
          variant: 'destructive',
          title: 'Erro ao registrar voto',
          description: errorMessage,
        });
      }
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if(!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "agora mesmo";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "ontem";
    return `há ${diffInDays} dias`;
  };

  if (reviews.length === 0) return null;

  return (
    <Carousel 
        opts={{
            align: "start",
            loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full"
    >
        <CarouselContent>
            {reviews.map(review => {
                const hasVoted = votedReviewIds.includes(review.id);
                return (
                    <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                            <Card className="bg-card/50 shadow-sm flex flex-col h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <StarRating rating={review.rating} />
                                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    {review.text && (
                                        <blockquote className="relative p-4 text-sm border-l-4 border-primary/50 bg-background rounded-r-lg h-24 overflow-y-auto">
                                            <Quote className="absolute -top-2 -left-3 h-5 w-5 text-primary/50" />
                                            {review.text}
                                        </blockquote>
                                    )}
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-4 pt-3">
                                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className='flex items-center gap-4 flex-wrap'>
                                            <Link href={`/teachers/${review.teacherId}`} className="flex items-center gap-1.5 group" title={`Professor(a) ${review.teacherName}`}>
                                                <User className="h-4 w-4" />
                                                <span className="font-medium truncate group-hover:underline group-hover:text-primary">{review.teacherName}</span>
                                            </Link>
                                            <div className="flex items-center gap-1.5 flex-wrap" title={`Matérias`}>
                                            <Book className="h-4 w-4" />
                                            {review.subjectNames?.map((subjectName, index) => (
                                                <Link href={`/subjects/${review.subjectIds?.[index]}`} key={`${review.id}-${review.subjectIds?.[index]}`}>
                                                <Badge variant="secondary" className="hover:bg-primary/20 transition-colors">{subjectName}</Badge>
                                                </Link>
                                            ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-center">
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleVote(review.id, 'up')}
                                                    disabled={isPending || hasVoted}
                                                    aria-label={hasVoted ? "Você já votou" : "Votar positivo"}
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xs font-medium w-4 text-center">{review.upvotes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleVote(review.id, 'down')}
                                                    disabled={isPending || hasVoted}
                                                    aria-label={hasVoted ? "Você já votou" : "Votar negativo"}
                                                >
                                                    <ThumbsDown className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xs font-medium w-4 text-center">{review.downvotes}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </CarouselItem>
                )
            })}
        </CarouselContent>
    </Carousel>
  );
}

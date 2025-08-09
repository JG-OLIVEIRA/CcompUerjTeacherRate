
'use client';

import Link from 'next/link';
import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import StarRating from './star-rating';
import { Badge } from './ui/badge';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherListItemProps {
  teacher: Teacher;
}

export default function TeacherListItem({ teacher }: TeacherListItemProps) {
  const { id, name, averageRating = 0, reviews, subjects } = teacher;

  const totalReviewCount = reviews.length;


  return (
    <Link href={`/teachers/${id}`} className="flex h-full">
      <Card 
          className={cn(
              "w-full hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer",
              "border-2 border-transparent hover:border-primary bg-card/50"
          )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center gap-3 pt-2">
          <div className="flex items-center gap-2">
              <StarRating rating={averageRating} />
              <span className="font-bold text-sm text-muted-foreground">{averageRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{totalReviewCount} {totalReviewCount === 1 ? 'avaliação' : 'avaliações'}</span>
          </div>
        </CardContent>
         <CardFooter className="flex-col items-start gap-4 pt-4">
           <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Principais Matérias</h4>
              {subjects && subjects.size > 0 ? (
                  <div className="flex flex-wrap gap-1">
                      {Array.from(subjects).sort().slice(0, 3).map((subjectName) => (
                          <Badge key={subjectName} variant="secondary">{subjectName}</Badge>
                      ))}
                      {subjects.size > 3 && <Badge variant="outline">...</Badge>}
                  </div>
              ) : (
                   <p className="text-xs text-muted-foreground">Nenhuma matéria registrada.</p>
              )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

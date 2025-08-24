
'use client';

import * as LucideIcons from 'lucide-react';
import type { Subject } from '@/lib/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Users, Star } from 'lucide-react';
import { Badge } from './ui/badge';

const getIconComponent = (iconName: string): React.ElementType => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.GraduationCap;
};

export default function SubjectSection({ subject }: { subject: Subject }) {
  const Icon = getIconComponent(subject.iconName);
  
  const topTeacher = [...subject.teachers].sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))[0];

  return (
    <Link href={`/subjects/${subject.id}`} className="block h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary border-2 border-transparent bg-card/80">
        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
          <Icon className="h-8 w-8 text-primary" />
          <CardTitle className="text-lg font-semibold leading-tight">{subject.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground space-y-3">
            <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{subject.teachers.length} {subject.teachers.length === 1 ? 'professor avaliado' : 'professores avaliados'}</span>
            </div>
            {topTeacher && (
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>
                        Melhor nota: <Badge variant="secondary">{topTeacher.averageRating?.toFixed(1)} ({topTeacher.name})</Badge>
                    </span>
                </div>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}


'use client';

import * as LucideIcons from 'lucide-react';
import type { Subject } from '@/lib/types';
import TeacherCard from '@/components/teacher-card';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const getIconComponent = (iconName: string): React.ElementType => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.GraduationCap;
};


export default function SubjectSection({ subject }: SubjectSectionProps) {
  // Sort teachers by average rating (desc), then by number of reviews (desc)
  const sortedTeachers = [...subject.teachers].sort((a, b) => {
    const ratingA = a.averageRating ?? 0;
    const ratingB = b.averageRating ?? 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }
    return b.reviews.length - a.reviews.length;
  });
  
  const topTeacher = sortedTeachers.length > 0 && (sortedTeachers[0].averageRating ?? 0) >= 4 ? sortedTeachers[0] : null;

  const Icon = getIconComponent(subject.iconName);

  return (
    <AccordionItem value={`subject-${subject.id}`} className="bg-card border rounded-lg shadow-sm">
        <AccordionTrigger className="hover:no-underline p-4">
            <div id={`subject-title-${subject.id}`} className="flex items-center gap-3 w-full">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground text-left flex-1">
                {subject.name}
                </h3>
            </div>
        </AccordionTrigger>
      <AccordionContent>
        <div className="px-4 pb-4">
            {sortedTeachers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedTeachers.map((teacher) => (
                    <TeacherCard
                      key={teacher.id}
                      teacher={teacher} // teacher já vem com a matéria do data-service
                      isTopTeacher={teacher.id === topTeacher?.id}
                    />
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-4 border rounded-lg bg-background">Nenhum professor cadastrado nesta matéria ainda.</p>
            )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface SubjectSectionProps {
  subject: Subject;
}

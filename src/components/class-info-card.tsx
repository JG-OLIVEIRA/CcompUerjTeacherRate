
'use client';

import type { ClassInfo, Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Clock, MapPin, Star, AlertCircle, TrendingUp, CheckCircle2, ChevronRightCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StarRating from './star-rating';

interface ClassInfoCardProps {
  classInfo: ClassInfo;
  evaluatedTeacher?: Teacher;
}

const StatItem = ({ icon: Icon, label, value, tooltip }: { icon: React.ElementType, label: string, value: string | number, tooltip?: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="font-medium">{label}:</span>
          <span className="font-semibold text-foreground">{value}</span>
        </div>
      </TooltipTrigger>
      {tooltip && <TooltipContent><p>{tooltip}</p></TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

const DemandIndicator = ({ label, requests, vacancies }: { label: string; requests: number; vacancies: number }) => {
  const demand = vacancies > 0 ? (requests / vacancies) * 100 : requests > 0 ? 200 : 0; // Cap demand visualization
  const demandColor = demand > 90 ? 'bg-red-500' : demand > 60 ? 'bg-yellow-500' : 'bg-green-500';
  const demandRatio = vacancies > 0 ? (requests/vacancies).toFixed(1) : "N/A";

  return (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{label}</span>
            <span className="font-mono">{requests} / {vacancies}</span>
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Progress value={demand} className="h-2 [&>div]:bg-red-500" indicatorClassName={demandColor} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Relação candidato/vaga: {demandRatio}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
};


export default function ClassInfoCard({ classInfo, evaluatedTeacher }: ClassInfoCardProps) {
    const totalVacancies = classInfo.offered_uerj + classInfo.offered_vestibular;
    const totalOccupied = classInfo.occupied_uerj + classInfo.occupied_vestibular;
    const occupancyRate = totalVacancies > 0 ? (totalOccupied / totalVacancies) * 100 : 0;
    
    return (
        <Card className="flex flex-col bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle>Turma {classInfo.number}</CardTitle>
                    {classInfo.preferential && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     <Badge variant="outline" className="border-amber-500 text-amber-600">
                                        <Star className="h-3 w-3 mr-1.5" />
                                        Preferencial
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Esta turma é preferencial para calouros.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <CardDescription className="pt-1">
                    <div className={cn("flex items-center gap-2 group", evaluatedTeacher && "cursor-pointer")}>
                        <Users className="h-4 w-4" /> 
                        {evaluatedTeacher ? (
                             <Link href={`/teachers/${evaluatedTeacher.id}`} className="flex items-center gap-2 group-hover:underline text-foreground font-semibold">
                                <span>{evaluatedTeacher.name}</span>
                                <ChevronRightCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
                            </Link>
                        ) : (
                             <span>{classInfo.teacher || 'Docente a definir'}</span>
                        )}
                    </div>
                     {evaluatedTeacher && (
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={evaluatedTeacher.averageRating || 0} />
                            <span className="text-sm font-bold text-muted-foreground">
                                {(evaluatedTeacher.averageRating || 0).toFixed(1)}
                            </span>
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
                 <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" /> 
                    <span className="font-semibold">{classInfo.times}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" /> 
                    <span>{classInfo.location || 'Local a definir'}</span>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4"/> Demanda por Vaga
                    </h4>
                    <DemandIndicator label="UERJ" requests={classInfo.request_uerj_total} vacancies={classInfo.offered_uerj} />
                    <DemandIndicator label="Vestibular" requests={classInfo.request_vestibular_total} vacancies={classInfo.offered_vestibular} />
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-3 text-xs text-muted-foreground bg-secondary/50 p-4 rounded-b-lg">
                <div className="w-full flex justify-between items-center">
                    <span>Vagas Ocupadas</span>
                    <span className="font-mono font-semibold text-foreground">{totalOccupied} / {totalVacancies}</span>
                </div>
                <Progress value={occupancyRate} className="h-2" />
                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full pt-2">
                    <StatItem icon={CheckCircle2} label="UERJ" value={`${classInfo.occupied_uerj}/${classInfo.offered_uerj}`} tooltip="Vagas Ocupadas / Oferecidas (UERJ)" />
                    <StatItem icon={CheckCircle2} label="Vest." value={`${classInfo.occupied_vestibular}/${classInfo.offered_vestibular}`} tooltip="Vagas Ocupadas / Oferecidas (Vestibular)" />
                    <StatItem icon={AlertCircle} label="Pref. UERJ" value={`${classInfo.request_uerj_preferential}`} tooltip="Pedidos Preferenciais (UERJ)" />
                    <StatItem icon={AlertCircle} label="Pref. Vest." value={`${classInfo.request_vestibular_preferential}`} tooltip="Pedidos Preferenciais (Vestibular)" />
                 </div>
            </CardFooter>
        </Card>
    );
}

// Extend Progress component to accept indicatorClassName
declare module "@/components/ui/progress" {
    interface ProgressProps extends React.RefAttributes<HTMLDivElement> {
        indicatorClassName?: string;
    }
}

// Monkey-patching Progress to allow custom indicator color
import { Progress as OriginalProgress } from '@/components/ui/progress';
import * as React from 'react';
import * as ProgressPrimitive from "@radix-ui/react-progress"

const PatchedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
PatchedProgress.displayName = "Progress"

// @ts-ignore
OriginalProgress.render = PatchedProgress.render;
// @ts-ignore
OriginalProgress.displayName = PatchedProgress.displayName;

'use client';

import React from 'react';
import type { ClassInfo, Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Clock, MapPin, Star, AlertCircle, TrendingUp, CheckCircle2, ChevronRightCircle } from 'lucide-react';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { cn, formatSchedule, cleanTeacherName, capitalizeTeacherName } from '@/lib/utils';
import StarRating from './star-rating';

interface ClassInfoCardProps {
  classInfo: ClassInfo;
  teacher?: Teacher | Teacher[]; // Can be a single teacher or an array of teachers
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
  const demandColor = demand > 100 ? 'bg-red-500' : demand > 80 ? 'bg-yellow-500' : 'bg-green-500';
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
                    <Progress value={Math.min(100, demand)} className="h-2" indicatorClassName={demandColor} />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Relação candidato/vaga: {demandRatio}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
};


export default function ClassInfoCard({ classInfo, teacher }: ClassInfoCardProps) {
    const totalVacancies = classInfo.offered_uerj + classInfo.offered_vestibular;
    const totalOccupied = classInfo.occupied_uerj + classInfo.occupied_vestibular;
    const occupancyRate = totalVacancies > 0 ? (totalOccupied / totalVacancies) * 100 : 0;
    
    // The capitalizeTeacherName function now handles splitting names.
    const teacherNameToDisplay = capitalizeTeacherName(cleanTeacherName(classInfo.teacher)) || 'Docente a definir';
    const formattedTime = formatSchedule(classInfo.times);
    
    const teachersArray = Array.isArray(teacher) ? teacher : (teacher ? [teacher] : []);


    return (
        <Card className="flex flex-col bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle>Turma {classInfo.number}</CardTitle>
                </div>
                <CardDescription className="pt-1">
                    <div className="flex items-center gap-2 group">
                        <Users className="h-4 w-4" /> 
                        {teachersArray.length > 0 ? (
                             <div className="flex flex-wrap items-center gap-x-1 text-foreground font-semibold">
                                {teachersArray.map((t, index) => (
                                    <React.Fragment key={t.id}>
                                        <Link href={`/teachers/${t.id}`} className="hover:underline flex items-center gap-1">
                                            <span>{capitalizeTeacherName(t.name)}</span>
                                            <ChevronRightCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
                                        </Link>
                                        {index < teachersArray.length - 1 && <span> e </span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                             <span>{teacherNameToDisplay}</span>
                        )}
                    </div>
                     {teachersArray.length === 1 && teachersArray[0].averageRating !== undefined && teachersArray[0].reviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={teachersArray[0].averageRating || 0} />
                            <span className="text-sm font-bold text-muted-foreground">
                                {(teachersArray[0].averageRating || 0).toFixed(1)}
                            </span>
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
                 <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" /> 
                    <span className="font-semibold">{formattedTime}</span>
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

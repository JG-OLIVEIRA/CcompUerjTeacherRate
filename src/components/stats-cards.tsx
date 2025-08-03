
'use client';

import { Users, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StatsCardsProps {
    stats: {
        totalTeachers: number;
        totalReviews: number;
        newReviewsThisWeek: number;
    };
}

const StatCard = ({
    icon: Icon,
    title,
    value,
    note,
    iconColorClass = 'text-primary'
}: {
    icon: React.ElementType,
    title: string,
    value: string | number,
    note?: string,
    iconColorClass?: string,
}) => (
    <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 text-muted-foreground ${iconColorClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </CardContent>
    </Card>
);


export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard
                icon={Users}
                title="Professores"
                value={stats.totalTeachers}
                note="Professores na plataforma"
            />
            <StatCard
                icon={Star}
                title="Avaliações"
                value={stats.totalReviews}
                note="Feedbacks de alunos"
                iconColorClass="text-primary"
            />
            <StatCard
                icon={TrendingUp}
                title="Novas na Semana"
                value={`+${stats.newReviewsThisWeek}`}
                note="Avaliações recentes"
                iconColorClass="text-primary"
            />
        </div>
    );
}

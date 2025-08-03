
'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName = keyof typeof LucideIcons;

export interface HeaderProps {
    pageTitle: string;
    pageIconName: IconName;
    children?: React.ReactNode;
}

const getIconComponent = (iconName: IconName) => {
    const Icon = LucideIcons[iconName] as React.ElementType;
    // Add UserCircle as a potential fallback, or handle it explicitly if it's a common case
    return Icon || LucideIcons.GraduationCap;
};

export default function Header({ pageTitle, pageIconName, children }: HeaderProps) {
  const PageIcon = getIconComponent(pageIconName);
    
  return (
    <header 
        className="w-full border-b bg-background relative"
    >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <PageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    <h1 className={cn(
                        "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter",
                        "font-headline-retro text-primary-dark"
                    )}>
                        <span className="shine">{pageTitle}</span>
                    </h1>
                </div>
                {children}
            </div>
        </div>
    </header>
  );
}

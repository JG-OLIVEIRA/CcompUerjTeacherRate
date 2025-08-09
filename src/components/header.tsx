
'use client';

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { logout } from '@/lib/auth-actions';
import { User, LogOut, LogIn } from 'lucide-react';

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

const AuthButton = () => {
    const { user } = useAuth();
    
    if (user) {
        return (
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                </div>
                <form action={logout}>
                    <Button variant="outline" size="sm">
                        <LogOut className="mr-2 h-4 w-4"/>
                        Sair
                    </Button>
                </form>
            </div>
        )
    }

    return (
        <Button asChild variant="outline" size="sm">
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4"/>
                Login
            </Link>
        </Button>
    )
}


export default function Header({ pageTitle, pageIconName, children }: HeaderProps) {
  const PageIcon = getIconComponent(pageIconName);
    
  return (
    <header 
        className="w-full border-b bg-background relative overflow-hidden"
    >
        <div className="absolute top-4 right-4 z-20">
            <AuthButton />
        </div>
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

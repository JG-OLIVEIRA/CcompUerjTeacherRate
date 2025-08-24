
'use client';

import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import type { Teacher } from '@/lib/types';
import TeacherListItem from '@/components/teacher-list-item';
import { Input } from '@/components/ui/input';

interface TeacherListClientProps {
  initialTeachers: Teacher[];
}

export default function TeacherListClient({ initialTeachers }: TeacherListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    // Sort teachers alphabetically by name first
    const sorted = [...initialTeachers].sort((a, b) => a.name.localeCompare(b.name));

    if (!lowercasedQuery) {
        return sorted;
    }

    return sorted.filter(teacher => 
        teacher.name.toLowerCase().includes(lowercasedQuery)
    );
  }, [initialTeachers, searchQuery]);

  const noResults = filteredTeachers.length === 0;

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-7 w-7 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Todos os Professores
        </h2>
      </div>
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Pesquisar por professor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
            />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {noResults ? (
             <div className="col-span-full text-center text-muted-foreground py-12 border-dashed border-2 rounded-lg">
                <h2 className="text-xl font-semibold">Nenhum resultado encontrado para "{searchQuery}".</h2>
                <p className="mt-2">Tente um termo de busca diferente.</p>
            </div>
        ) : (
            filteredTeachers.map((teacher) => (
              <TeacherListItem 
                key={teacher.id} 
                teacher={teacher}
              />
            ))
        )}
      </div>
    </>
  );
}

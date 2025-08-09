
'use client';

import { useState, useMemo } from 'react';
import type { SubjectLink } from '@/lib/types';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { upsertSubjectLink, deleteSubjectLink } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Edit, Save, Trash, ExternalLink, MessageSquarePlus, X } from 'lucide-react';

interface GroupLinksClientProps {
  initialLinks: SubjectLink[];
}

const getIconComponent = (iconName: string): React.ElementType => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.GraduationCap;
};

export default function GroupLinksClient({ initialLinks }: GroupLinksClientProps) {
  const [links, setLinks] = useState<SubjectLink[]>(initialLinks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentLinkValue, setCurrentLinkValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleEdit = (link: SubjectLink) => {
    setEditingId(link.subjectId);
    setCurrentLinkValue(link.linkUrl || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentLinkValue('');
  };

  const handleSave = async (subjectId: number) => {
    if (!currentLinkValue || !currentLinkValue.startsWith('https://chat.whatsapp.com/')) {
        toast({
            variant: "destructive",
            title: "Link Inválido",
            description: "Por favor, insira um link de convite do WhatsApp válido (ex: https://chat.whatsapp.com/...).",
        });
        return;
    }

    const result = await upsertSubjectLink({ subjectId, linkUrl: currentLinkValue });

    if (result.success) {
        setLinks(links.map(l => l.subjectId === subjectId ? { ...l, linkUrl: currentLinkValue } : l));
        toast({ title: "Sucesso!", description: result.message });
        handleCancel();
    } else {
        toast({ variant: "destructive", title: "Erro", description: result.message });
    }
  };
  
  const handleDelete = async (subjectId: number) => {
    const result = await deleteSubjectLink(subjectId);
    if (result.success) {
        setLinks(links.map(l => l.subjectId === subjectId ? { ...l, linkUrl: null } : l));
        toast({ title: "Sucesso!", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Erro", description: result.message });
    }
  }

  const filteredLinks = useMemo(() => {
    if (!searchQuery) return links;
    return links.filter(link =>
      link.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, links]);

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <Input
                placeholder="Pesquisar por matéria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-lg mx-auto"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => {
                const isEditing = editingId === link.subjectId;
                const Icon = getIconComponent(link.iconName);
                return (
                    <Card key={link.subjectId} className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary"/>
                                <span className="truncate">{link.subjectName}</span>
                            </CardTitle>
                             <CardDescription>
                                {isEditing ? "Cole o novo link do grupo." : (link.linkUrl ? "Link do grupo de WhatsApp." : "Nenhum link cadastrado.")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                           {isEditing ? (
                                <div className="space-y-2">
                                    <Input
                                        value={currentLinkValue}
                                        onChange={(e) => setCurrentLinkValue(e.target.value)}
                                        placeholder="https://chat.whatsapp.com/..."
                                    />
                                </div>
                           ) : (
                                link.linkUrl ? (
                                    <Button asChild variant="outline" className="w-full">
                                        <a href={currentLinkValue || link.linkUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4"/>
                                            Abrir Link do Grupo
                                        </a>
                                    </Button>
                                ) : (
                                    <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                                        <MessageSquarePlus className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                                        <p className="text-sm">Seja o primeiro a adicionar!</p>
                                    </div>
                                )
                           )}
                        </CardContent>
                        <CardContent className="flex justify-end gap-2">
                            {isEditing ? (
                                <>
                                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                                        <X className="mr-2 h-4 w-4"/>
                                        Cancelar
                                    </Button>
                                    <Button size="sm" onClick={() => handleSave(link.subjectId)}>
                                        <Save className="mr-2 h-4 w-4"/>
                                        Salvar
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {link.linkUrl && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-8 w-8">
                                                    <Trash className="h-4 w-4"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta ação removerá o link do grupo para "{link.subjectName}". A matéria continuará existindo, mas sem um grupo associado.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(link.subjectId)} className={buttonVariants({variant: "destructive"})}>
                                                        Sim, remover link
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(link)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        {link.linkUrl ? 'Editar' : 'Adicionar'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
             {filteredLinks.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">
                    Nenhuma matéria encontrada para "{searchQuery}".
                </div>
            )}
        </div>
    </div>
  );
}


"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from './ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Teacher } from '@/lib/types';
import { MultiSelect } from './ui/multi-select';

const formSchema = z.object({
  teacherName: z.string(), // Will be pre-filled and disabled
  subjectNames: z.array(z.string()).nonempty("É necessário selecionar pelo menos uma matéria."),
  reviewText: z.string().trim()
    .max(1000, "A avaliação deve ter no máximo 1000 caracteres.")
    .optional(),
  reviewRating: z.number().min(1, "A nota é obrigatória.").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface WelcomeReviewDialogProps {
    teacherToPrompt: Teacher;
    onSubmit: (data: Omit<FormValues, 'reviewAuthor'>) => Promise<{ success: boolean; message: string; }>;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function WelcomeReviewDialog({ 
    teacherToPrompt,
    onSubmit,
    open,
    setOpen,
}: WelcomeReviewDialogProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: teacherToPrompt.name,
      subjectNames: [],
      reviewText: "",
      reviewRating: 0,
    },
  });

  const subjectOptions = useMemo(() => {
    if (!teacherToPrompt.subjects) return [];
    return Array.from(teacherToPrompt.subjects)
        .map(name => ({ value: name, label: name }))
        .sort((a, b) => a.label.localeCompare(b.label));
  }, [teacherToPrompt.subjects]);


  const handleSubmit = async (values: FormValues) => {
    try {
        const result = await onSubmit({
          ...values,
          reviewText: values.reviewText || '', // Garante que o valor seja uma string vazia se for undefined
        });

        if (result.success) {
            toast({
                title: "Avaliação enviada!",
                description: "Obrigado por contribuir com a comunidade.",
            });
            setOpen(false);
            form.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Erro ao enviar avaliação",
                description: result.message,
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        toast({
            variant: "destructive",
            title: "Erro ao enviar avaliação",
            description: errorMessage,
        });
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset({
            teacherName: teacherToPrompt.name,
            subjectNames: [],
            reviewText: "",
            reviewRating: 0,
        });
    }
    setOpen(isOpen);
  }
  
  // Do not render the dialog if there are no subjects to choose from
  if (subjectOptions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                    <MessageSquarePlus className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl">Bem-vindo ao CcompTeacherRate!</DialogTitle>
                <DialogDescription className="text-base">
                    Já teve aula com <strong className="text-primary">{teacherToPrompt.name}</strong>? 
                    <br />
                    Contribua com uma avaliação e ajude outros alunos!
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                {/* Teacher name is displayed as text, not as a form field */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Professor</p>
                    <p className="font-semibold text-lg">{teacherToPrompt.name}</p>
                </div>
                
                <FormField
                    control={form.control}
                    name="subjectNames"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Qual matéria você cursou com este professor?</FormLabel>
                        <FormControl>
                           <MultiSelect
                                options={subjectOptions}
                                selected={field.value}
                                onChange={field.onChange}
                                placeholder="Selecione as matérias..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="reviewText"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sua Avaliação (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={`Compartilhe sua experiência com ${teacherToPrompt.name}...`}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reviewRating"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nota Geral</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                <button
                                    type="button"
                                    key={ratingValue}
                                    onClick={() => field.onChange(ratingValue)}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-0 bg-transparent border-none"
                                >
                                    <Star
                                    className={cn(
                                        'h-6 w-6 cursor-pointer',
                                        ratingValue <= (hoverRating || field.value)
                                        ? 'text-primary fill-current'
                                        : 'text-muted-foreground/50'
                                    )}
                                    />
                                </button>
                                );
                            })}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Depois</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                </div>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}

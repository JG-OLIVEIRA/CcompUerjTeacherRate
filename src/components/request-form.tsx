
'use client';

import { useSearchParams } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleRequest } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useEffect } from 'react';

const formSchema = z.object({
  professorName: z.string().trim().min(1, "O nome do professor é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido para contato."),
  message: z.string().trim().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

export default function RequestForm() {
  const searchParams = useSearchParams();
  const professorNameFromQuery = searchParams.get('professor');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professorName: professorNameFromQuery || "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    if (professorNameFromQuery) {
      form.setValue('professorName', professorNameFromQuery);
    }
  }, [professorNameFromQuery, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await handleRequest(values);
      if (result.success) {
        toast({
          title: "Solicitação Enviada!",
          description: result.message,
        });
        form.reset();
      } else {
         throw new Error(result.message || "Ocorreu um erro desconhecido.");
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast({
        variant: "destructive",
        title: "Erro ao Enviar Solicitação",
        description: errorMessage,
      });
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Formulário de Solicitação para Professores</CardTitle>
            <CardDescription>
                Este canal é para uso exclusivo de professores. Preencha os campos abaixo para nos enviar sua solicitação.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="professorName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome do Professor (conforme no site)</FormLabel>
                    <FormControl>
                        <Input placeholder="Digite o nome do professor" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Seu E-mail para Contato</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Sua Solicitação</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Gostaria de solicitar a remoção do meu nome da plataforma por motivos de privacidade."
                        rows={6}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

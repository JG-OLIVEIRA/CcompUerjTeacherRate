import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { whatsappLinks } from "@/lib/whatsapp-links";
import { getAllSubjectNames } from "@/lib/data-service";

export default async function GruposPage() {
    const allSubjectsInDb = await getAllSubjectNames();
    const allSubjectsSet = new Set(allSubjectsInDb.map(s => s.toLowerCase()));

    const subjectsWithLinks = Object.entries(whatsappLinks)
        .filter(([subjectName]) => allSubjectsSet.has(subjectName.toLowerCase()))
        .sort(([a], [b]) => a.localeCompare(b));

    const headerContent = (
        <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Encontre os grupos de WhatsApp para cada disciplina do curso. Um espaço para troca de informações, materiais e dúvidas.
            </p>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para a Página Inicial
                </Link>
            </Button>
        </div>
    );

    return (
        <MainLayout headerProps={{
            pageTitle: "Grupos de WhatsApp",
            pageIconName: "MessageSquare",
            children: headerContent
        }}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Links das Disciplinas</CardTitle>
                            <CardDescription>
                                Clique em uma disciplina para ver os links dos grupos disponíveis.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {subjectsWithLinks.length > 0 ? (
                                <Accordion type="multiple" className="w-full">
                                    {subjectsWithLinks.map(([subjectName, links]) => (
                                        <AccordionItem value={subjectName} key={subjectName}>
                                            <AccordionTrigger className="text-base font-semibold text-left hover:no-underline">
                                                {subjectName}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col gap-3 pt-2">
                                                    {links.map((link, index) => (
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            key={link}
                                                            className="flex items-center justify-between p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground"
                                                        >
                                                            <span>Turma {index + 1}</span>
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    Nenhum link de grupo de WhatsApp encontrado para as disciplinas cadastradas.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <footer className="text-center mt-16 pb-8">
                    <p className="text-sm text-muted-foreground">
                        Os links foram contribuídos pela comunidade. Encontrou um link quebrado ou quer adicionar um novo? Avise um administrador.
                    </p>
                </footer>
            </div>
        </MainLayout>
    );
}

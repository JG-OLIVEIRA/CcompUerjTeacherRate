
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RequestForm from "@/components/request-form";
import { Suspense } from "react";

export default function RequestPage() {

    const headerContent = (
        <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Este é um canal de comunicação direto para professores que desejam solicitar a remoção ou correção de seus dados, ou a exclusão de avaliações específicas. Solicitações de outros tipos não serão processadas por este canal.
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
            pageTitle: "Página de Solicitação",
            pageIconName: "Mail",
            children: headerContent
        }}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                   <Suspense fallback={<div>Carregando...</div>}>
                        <RequestForm />
                    </Suspense>
                </div>

                <footer className="text-center mt-16 pb-8">
                    <p className="text-sm text-muted-foreground">
                        Analisaremos sua solicitação e entraremos em contato o mais breve possível.
                    </p>
                </footer>
            </div>
        </MainLayout>
    );
}

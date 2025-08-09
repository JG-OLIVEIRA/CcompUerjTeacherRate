
import MainLayout from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { getSubjectLinks } from "@/lib/data-service";
import GroupLinksClient from "@/components/group-links-client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const dynamic = 'force-dynamic';

export default async function GruposPage() {
    const subjectLinks = await getSubjectLinks();

    const headerContent = (
        <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Encontre, adicione ou edite os links dos grupos de WhatsApp para cada matéria.
            </p>
             <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground mb-4">
                <Button asChild variant="outline">
                    <Link href="/subjects">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Matérias
                    </Link>
                </Button>
            </div>
             <Breadcrumb>
                <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                    <Link href="/">Início</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                     <BreadcrumbLink asChild>
                        <Link href="/subjects">Matérias</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Grupos de WhatsApp</BreadcrumbPage>
                </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );

    return (
        <MainLayout headerProps={{
            pageTitle: "Grupos de WhatsApp",
            pageIconName: "MessageSquareText",
            children: headerContent
        }}>
            <div className="container mx-auto px-4 py-8">
                <GroupLinksClient initialLinks={subjectLinks} />
            </div>
        </MainLayout>
    );
}

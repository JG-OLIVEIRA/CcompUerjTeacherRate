
'use server';

import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { z } from 'zod';

const UerjSubjectInputSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória.'),
  senha: z.string().min(1, 'Senha é obrigatória.'),
});
export type UerjSubjectInput = z.infer<typeof UerjSubjectInputSchema>;

const TurmaSchema = z.object({
  Turma: z.string().optional(),
  Docente: z.string().optional(),
  Local: z.string().optional(),
  Tempos: z.array(z.tuple([z.string(), z.string()])).optional(),
});

const DisciplinaSchema = z.object({
  nome: z.string(),
  turmas: z.array(TurmaSchema),
});

const UerjSubjectOutputSchema = z.object({
  disciplinas: z.array(DisciplinaSchema),
});
export type UerjSubjectOutput = z.infer<typeof UerjSubjectOutputSchema>;


export async function getUerjSubjects(input: UerjSubjectInput): Promise<UerjSubjectOutput> {
  const validation = UerjSubjectInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error('Dados de entrada inválidos.');
  }

  const { matricula, senha } = validation.data;
  
  const options = new chrome.Options()
    .headless()
    .windowSize({ width: 1920, height: 1080 })
    .addArguments("--no-sandbox", "--disable-dev-shm-usage");

  let driver: WebDriver | null = null;
  
  try {
    driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
    
    await driver.get("https://www.alunoonline.uerj.br");

    await driver.wait(until.elementLocated(By.name("matricula")), 20000)
      .sendKeys(matricula);
    await driver.findElement(By.name("senha")).sendKeys(senha);
    await driver.findElement(By.id("confirmar")).click();

    try {
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Login ou Senha Inválida')]")), 3000);
        throw new Error("Login ou Senha Inválida.");
    } catch (e) {
        // Se o erro de login não aparecer, continuar
        if ((e as Error).message === "Login ou Senha Inválida.") {
            throw e;
        }
    }

    const linkDisciplinas = await driver.wait(
      until.elementLocated(By.linkText("Disciplinas do Currículo/A Cursar")),
      20000
    );
    await linkDisciplinas.click();

    await driver.wait(until.elementsLocated(By.css("a.LINKNAOSUB span")), 20000);
    const spanDisciplinas = await driver.findElements(By.css("a.LINKNAOSUB span"));
    const nomesDisciplinas: string[] = [];
    for (const span of spanDisciplinas) {
      const text = await span.getText();
      nomesDisciplinas.push(text.trim());
    }

    const disciplinas = [];

    for (const nomeDisciplina of nomesDisciplinas) {
        if (!driver) break;
      const link = await driver.wait(
        until.elementLocated(By.xpath(`//a[@class='LINKNAOSUB'][span[contains(text(), '${nomeDisciplina}')]]`)),
        20000
      );
      await driver.executeScript("arguments[0].scrollIntoView();", link);
      await link.click();

      await driver.wait(until.elementsLocated(By.css("div[style*='float:left']")), 20000);
      const blocos = await driver.findElements(By.css("div[style*='float:left']"));

      const turmas: z.infer<typeof TurmaSchema>[] = [];
      let turmaAtual: z.infer<typeof TurmaSchema> = {};

      for (const bloco of blocos) {
        const subDivs = await bloco.findElements(By.css("div"));
        if (subDivs.length === 0) {
          const texto = (await bloco.getText()).replace(/\u00A0/g, "").trim();
          if (texto.startsWith("TURMA:")) {
            if (Object.keys(turmaAtual).length > 0) turmas.push(turmaAtual);
            turmaAtual = { Turma: texto.replace("TURMA:", "").trim() };
          }
          continue;
        }

        const label = (await subDivs[0].getText()).replace(/\u00A0/g, "").trim();
        if (!label) continue;

        if (label.includes("TURMA:")) {
          if (Object.keys(turmaAtual).length > 0) turmas.push(turmaAtual);
          turmaAtual = { Turma: label.replace("TURMA:", "").trim() };
        } else if (label.includes("Docente:")) {
          turmaAtual["Docente"] = await subDivs[1].getText();
        } else if (label.includes("Local")) {
          turmaAtual["Local"] = await subDivs[1].getText();
        } else if (label.includes("Tempos:")) {
          const dias = await subDivs[1].findElements(By.xpath("./div"));
          const tempos: [string, string][] = [];
          for (let j = 0; j < dias.length; j += 2) {
            const dia = await dias[j].getText();
            const horario = await dias[j + 1].getText();
            tempos.push([dia, horario]);
          }
          turmaAtual["Tempos"] = tempos;
        }
      }

      if (Object.keys(turmaAtual).length > 0) turmas.push(turmaAtual);
      
      disciplinas.push({ nome: nomeDisciplina, turmas });

      await driver.navigate().back();
      await driver.wait(until.elementsLocated(By.css("a.LINKNAOSUB span")), 20000);
    }
    
    return { disciplinas };

  } catch (error) {
    console.error("Erro no scraping:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido durante o scraping.";
    // Garante que a mensagem de erro seja propagada para a UI
    throw new Error(errorMessage);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

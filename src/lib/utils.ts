import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const subjectToSemesterMap: Record<string, number> = {
    "Geometria Analítica": 1,
    "Cálculo I": 1,
    "Álgebra": 1,
    "Matemática Discreta": 1,
    "Fundamentos da Computação": 1,
    "Álgebra Linear": 2,
    "Cálculo II": 2,
    "Cálculo das Probabilidades": 2,
    "Algoritmos e Est. de Dados I": 2,
    "Linguagem de Programação I": 2,
    "Física I": 2,
    "Português Instrumental": 3,
    "Cálculo III": 3,
    "Algoritmos e Est. de Dados II": 3,
    "Elementos de Lógica": 3,
    "Linguagem de Programação II": 3,
    "Teoria da Computação": 3,
    "Cálculo Numérico": 4,
    "Cálculo IV": 4,
    "Algoritmos em Grafos": 4,
    "Engenharia de Software": 4,
    "Arquitetura de Computadores I": 4,
    "Física II": 4,
    "Estruturas de Linguagens": 5,
    "Banco de Dados I": 5,
    "Otimização em Grafos": 5,
    "Análise e Proj. de Sistemas": 5,
    "Sistemas Operacionais I": 5,
    "Arquitetura de Computadores II": 5,
    "Eletiva Básica": 5,
    "Otimização Combinatória": 6,
    "Banco de Dados II": 6,
    "Interfaces Humano-Comp.": 6,
    "Eletiva I": 6,
    "Sistemas Operacionais II": 6,
    "Compiladores": 6,
    "Computação Gráfica": 7,
    "Inteligência Artificial": 7,
    "Ética Comp. e Sociedade": 7,
    "Metod. Cient. no Projeto Final": 7,
    "Redes de Computadores I": 7,
    "Arq. Avançadas de Computadores": 7,
    "Eletiva II": 8,
    "Eletiva III": 8,
    "Projeto Final": 8,
    "Sistemas Distribuídos": 8,
    "Eletiva IV": 8
};


const timeSlotMap: { [key: string]: string } = {
    'M1': '07:00-07:50',
    'M2': '07:50-08:40',
    'M3': '08:50-09:40',
    'M4': '09:40-10:30',
    'M5': '10:40-11:30',
    'M6': '11:30-12:20',
    'T1': '12:30-13:20',
    'T2': '13:20-14:10',
    'T3': '14:20-15:10',
    'T4': '15:10-16:00',
    'T5': '16:10-17:00',
    'T6': '17:00-17:50',
    'N1': '18:00-18:50',
    'N2': '18:50-19:40',
    'N3': '19:40-20:30',
    'N4': '20:30-21:20',
    'N5': '21:20-22:10',
};

const dayMap: { [key: string]: string } = {
  '2': 'Seg',
  '3': 'Ter',
  '4': 'Qua',
  '5': 'Qui',
  '6': 'Sex',
  '7': 'Sáb',
};

export function formatSchedule(scheduleString: string | null | undefined): string {
    if (!scheduleString) return 'Horário a definir';

    // Matches patterns like 2M1M2 or 4T12
    const scheduleParts = scheduleString.match(/[2-7][MTN][0-9MTN]+/g);
    if (!scheduleParts) return scheduleString;

    const dailySchedules: { [dayCode: string]: string[] } = {};

    for (const part of scheduleParts) {
        const dayCode = part[0];
        if (!dailySchedules[dayCode]) {
            dailySchedules[dayCode] = [];
        }

        const timePart = part.substring(1); // e.g., M1M2 or T12
        
        let currentTurn = '';
        let currentBlock = '';

        for (const char of timePart) {
            if (['M', 'T', 'N'].includes(char)) {
                if (currentBlock && currentTurn) {
                    for (const num of currentBlock) {
                        dailySchedules[dayCode].push(`${currentTurn}${num}`);
                    }
                }
                currentTurn = char;
                currentBlock = '';
            } else if (/[1-6]/.test(char)) {
                 if (currentTurn) {
                    currentBlock += char;
                }
            }
        }
        if (currentBlock && currentTurn) {
             for (const num of currentBlock) {
                dailySchedules[dayCode].push(`${currentTurn}${num}`);
            }
        }
    }

    const formattedDays: string[] = [];

    Object.keys(dailySchedules).sort().forEach(dayCode => {
        const dayName = dayMap[dayCode];
        const timeSlots = dailySchedules[dayCode];

        if (timeSlots.length > 0) {
            timeSlots.sort((a, b) => {
                const turnOrder = { 'M': 1, 'T': 2, 'N': 3 };
                const aTurn = a.charAt(0) as keyof typeof turnOrder;
                const bTurn = b.charAt(0) as keyof typeof turnOrder;
                const aNum = parseInt(a.substring(1));
                const bNum = parseInt(b.substring(1));

                if (aTurn !== bTurn) {
                    return turnOrder[aTurn] - turnOrder[bTurn];
                }
                return aNum - bNum;
            });

            const mergedSlots: string[] = [];
            let currentGroup: string[] = [];

            const isConsecutive = (slot1: string, slot2: string): boolean => {
                const turn1 = slot1.charAt(0);
                const turn2 = slot2.charAt(0);
                const num1 = parseInt(slot1.substring(1));
                const num2 = parseInt(slot2.substring(1));
                return turn1 === turn2 && num2 === num1 + 1 && timeSlotMap[slot1]?.split('-')[1] === timeSlotMap[slot2]?.split('-')[0];
            };

            for (let i = 0; i < timeSlots.length; i++) {
                if (currentGroup.length === 0) {
                    currentGroup.push(timeSlots[i]);
                } else if (isConsecutive(currentGroup[currentGroup.length - 1], timeSlots[i])) {
                    currentGroup.push(timeSlots[i]);
                } else {
                    const firstSlot = timeSlotMap[currentGroup[0]];
                    const lastSlot = timeSlotMap[currentGroup[currentGroup.length - 1]];
                    if (firstSlot && lastSlot) {
                        mergedSlots.push(`${firstSlot.split('-')[0]}-${lastSlot.split('-')[1]}`);
                    }
                    currentGroup = [timeSlots[i]];
                }
            }
            if (currentGroup.length > 0) {
                const firstSlot = timeSlotMap[currentGroup[0]];
                const lastSlot = timeSlotMap[currentGroup[currentGroup.length - 1]];
                if (firstSlot && lastSlot) {
                    mergedSlots.push(`${firstSlot.split('-')[0]}-${lastSlot.split('-')[1]}`);
                }
            }

            if (mergedSlots.length > 0) {
                formattedDays.push(`${dayName} ${mergedSlots.join(', ')}`);
            }
        }
    });

    if (formattedDays.length === 0) {
        return scheduleString; 
    }

    return formattedDays.join(' | ');
}

export function cleanTeacherName(name: string | undefined | null): string {
    if (!name) return '';
    return name.trim();
}


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

const flowchartData = [
    { semester: 1, subjects: ["geometria analítica", "cálculo i", "álgebra", "matemática discreta", "fundamentos da computação"] },
    { semester: 2, subjects: ["álgebra linear", "cálculo ii", "cálculo das probabilidades", "algoritmos e estruturas de dados i", "linguagem de programação i", "física i"] },
    { semester: 3, subjects: ["português instrumental", "cálculo iii", "algoritmos e estruturas de dados ii", "elementos de lógica", "linguagem de programação ii", "teoria da computação"] },
    { semester: 4, subjects: ["cálculo numérico", "cálculo iv", "algoritmos em grafos", "engenharia de software", "arquitetura de computadores i", "física ii"] },
    { semester: 5, subjects: ["estruturas de linguagens", "banco de dados i", "otimização em grafos", "análise e projeto de sistemas", "sistemas operacionais i", "arquitetura de computadores ii", "eletiva básica"] },
    { semester: 6, subjects: ["otimização combinatória", "banco de dados ii", "interfaces humano-computador", "eletiva i", "sistemas operacionais ii", "compiladores"] },
    { semester: 7, subjects: ["computação gráfica", "inteligência artificial", "ética computacional e sociedade", "metodologia científica no projeto final", "redes de computadores i", "arquiteturas avançadas de computadores"] },
    { semester: 8, subjects: ["eletiva ii", "eletiva iii", "projeto final", "sistemas distribuídos", "eletiva iv"] },
];

export const subjectToSemesterMap = flowchartData.reduce((acc, semester) => {
    semester.subjects.forEach(subject => {
        acc[subject] = semester.semester;
    });
    return acc;
}, {} as Record<string, number>);

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

    // Ex: "2M124T3" -> ["2M124", "T3"] (errado) -> queremos ["2M124T3"]
    // Ex: "3M34 5M34" -> ["3M34", "5M34"] (certo)
    // O regex agora procura por um dia da semana ([2-7]) seguido por qualquer combinação de turnos e aulas.
    const scheduleParts = scheduleString.match(/([2-7][MTN][0-9]+)/g);
    if (!scheduleParts) return 'Horário a definir';

    const dailySchedules: { [key: string]: string[] } = {};

    for (const part of scheduleParts) {
        const dayCode = part[0];
        // Extrai os blocos de horário, ex: "M124" -> ["M1", "M2", "M4"]
        const timeCodesRaw = part.substring(1); // "M124"
        const timeCodes = timeCodesRaw.match(/[MTN][1-6]/g) || []; // ["M1", "M2", "M4"] (exemplo corrigido)
        
        if (!dailySchedules[dayCode]) {
            dailySchedules[dayCode] = [];
        }
        dailySchedules[dayCode].push(...timeCodes);
    }
    
    const formattedDays: string[] = [];

    for (const dayCode in dailySchedules) {
        const dayName = dayMap[dayCode];
        const timeSlots = dailySchedules[dayCode];
        
        if (timeSlots.length > 0) {
            // Ordena os slots para garantir a contiguidade correta, ex: T1, M1 -> M1, T1
            timeSlots.sort((a, b) => {
              const aTurn = a.charAt(0);
              const bTurn = b.charAt(0);
              const aNum = parseInt(a.substring(1));
              const bNum = parseInt(b.substring(1));

              if (aTurn !== bTurn) {
                return aTurn.localeCompare(bTurn);
              }
              return aNum - bNum;
            });

            const firstSlot = timeSlotMap[timeSlots[0]];
            const lastSlot = timeSlotMap[timeSlots[timeSlots.length - 1]];
            
            if (firstSlot && lastSlot) {
                const startTime = firstSlot.split('-')[0];
                const endTime = lastSlot.split('-')[1];
                formattedDays.push(`${dayName} ${startTime}-${endTime}`);
            }
        }
    }

    if (formattedDays.length === 0) {
        return scheduleString; // Retorna a string original se nada for formatado
    }

    return formattedDays.join(' | ');
}

export function cleanTeacherName(name: string | undefined | null): string {
    if (!name) return '';
    return name.trim();
}

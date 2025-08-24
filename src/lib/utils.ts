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

    // Agrupa horários por dia. Ex: { '2': ['M1', 'M2'], '4': ['T1', 'T2'] }
    const dailySchedules: { [key: string]: string[] } = {};
    const scheduleParts = scheduleString.match(/([2-7])([MTN][1-6]+)/g) || [];

    for (const part of scheduleParts) {
        const dayCode = part[0];
        const timeCodes = part.substring(1).match(/[MTN][1-6]/g) || [];
        if (!dailySchedules[dayCode]) {
            dailySchedules[dayCode] = [];
        }
        dailySchedules[dayCode].push(...timeCodes);
    }
    
    const formattedDays: string[] = [];

    // Processa cada dia para encontrar blocos contíguos de horário
    for (const dayCode in dailySchedules) {
        const dayName = dayMap[dayCode];
        const timeSlots = dailySchedules[dayCode];

        if (timeSlots.length > 0) {
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
        return 'Horário a definir';
    }

    return formattedDays.join(' | ');
}

export function cleanTeacherName(name: string | undefined | null): string {
    if (!name) return '';
    return name.replace(/ Vagas.*$/, '').trim();
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const timeSlotMap: { [key: string]: string } = {
  M1: '07:00-07:50',
  M2: '07:50-08:40',
  M3: '08:50-09:40',
  M4: '09:40-10:30',
  M5: '10:40-11:30',
  M6: '11:30-12:20',
  T1: '12:30-13:20',
  T2: '13:20-14:10',
  T3: '14:20-15:10',
  T4: '15:10-16:00',
  T5: '16:10-17:00',
  T6: '17:00-17:50',
  N1: '18:00-18:50',
  N2: '18:50-19:40',
  N3: '19:40-20:30',
  N4: '20:30-21:20',
  N5: '21:20-22:10',
};

const dayMap: { [key: string]: string } = {
  '2': 'Segunda',
  '3': 'Terça',
  '4': 'Quarta',
  '5': 'Quinta',
  '6': 'Sexta',
  '7': 'Sábado',
};

export function formatSchedule(scheduleString: string | null | undefined): string {
  if (!scheduleString) return 'Horário a definir';

  // Split by potential separators like comma or space
  const parts = scheduleString.split(/[, ]+/).filter(p => p.trim() !== '');
  const formattedSchedules: string[] = [];

  parts.forEach(part => {
    // Regex to match a day code followed by time codes, e.g., "2M1M2"
    const dayMatch = part.match(/^([2-7])([MTN][1-6]+)$/);
    if (!dayMatch) {
        // Fallback for parts that don't match the combined format
        const dayCodeMatch = part.match(/^[2-7]/);
        if (dayCodeMatch) {
            const dayCode = dayCodeMatch[0];
            const dayName = dayMap[dayCode];
            const timeCodes = part.substring(1).match(/[MTN][1-6]/g);
            if (timeCodes && timeCodes.length > 0) {
                 const firstSlot = timeSlotMap[timeCodes[0]];
                const lastSlot = timeSlotMap[timeCodes[timeCodes.length - 1]];
                 if (firstSlot && lastSlot) {
                    const startTime = firstSlot.split('-')[0];
                    const endTime = lastSlot.split('-')[1];
                    formattedSchedules.push(`${dayName}, ${startTime} - ${endTime}`);
                }
            }
        }
        return;
    };

    const [, dayCode, timeBlock] = dayMatch;
    const dayName = dayMap[dayCode];
    const timeCodes = timeBlock.match(/[MTN][1-6]/g);

    if (!timeCodes || timeCodes.length === 0) return;

    const firstSlot = timeSlotMap[timeCodes[0]];
    const lastSlot = timeSlotMap[timeCodes[timeCodes.length - 1]];

    if (firstSlot && lastSlot) {
      const startTime = firstSlot.split('-')[0];
      const endTime = lastSlot.split('-')[1];
      formattedSchedules.push(`${dayName}, ${startTime} - ${endTime}`);
    }
  });

  return formattedSchedules.length > 0 ? formattedSchedules.join(' | ') : scheduleString;
}

import { formatDateStringToISO } from "./helpers";

/**
 * ignore past times from the current time on client
 * @param slots HH:mm
 * @param selectedDate yyyy-mm-dd
 * @returns new list of available and validated times
 */
export const filterValidTimes = (slots: string[], selectedDate: string): string[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parse selectedDate 
    const selected = formatDateStringToISO(selectedDate);

    // if selected isnt today, return all the slots
    if (selected.getTime() !== today.getTime()) {
        return slots;
    }

    // if it is today, filter only future available times (validated)
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return slots.filter(slot => slot > currentTime);
};
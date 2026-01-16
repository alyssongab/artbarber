  /**
   * Convert from ISO 8601 datetime to pt-BR date format
   * @param datetimeStr ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @returns date in pt-BR format (dd/mm/yyyy)
   */
  export const formatDate = (datetimeStr: string) => {
    const date = new Date(datetimeStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Convert from ISO 8601 datetime to local time format
   * @param datetimeStr ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @returns time in HH:mm format (local timezone)
   */
  export const formatTime = (datetimeStr: string) => {
    const date = new Date(datetimeStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * Combine date (YYYY-MM-DD) and time (HH:mm) into ISO 8601 datetime string in UTC
   * Converts from user's local timezone to UTC automatically
   * @param dateStr Date in YYYY-MM-DD format
   * @param timeStr Time in HH:mm format
   * @returns ISO 8601 datetime string in UTC
   */
  export const combineDateTimeToISO = (date: string, time: string): string => {
    // Parse date and time components
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date in user's LOCAL timezone
    const localDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // toISOString() automatically converts to UTC
    return localDateTime.toISOString(); // e.g., "2026-01-15T18:30:00.000Z" if user is in UTC-4
  };

  /**
   * Converts datetime into date string
   * @param date in format datetime (YYYY-MM-DDTHH:mm:ss)
   * @returns date in string format yyyy-mm-dd
   */
  export const formatToISOStandard = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  }

  export const capitalizeStatus = (stts: string): string => {
    switch(stts){
        case "PENDENTE": return "Agendado";
        case "CONCLUIDO": return "Concluído";
        case "CANCELADO": return "Cancelado";
        default: return stts;
    }
  }

  /**
   * Check if an appointment can be cancelled (must be in the future)
   * @param datetimeStr ISO 8601 datetime string
   * @returns true if appointment is in the future
   */
  export const canCancelAppointment = (datetimeStr: string): boolean => {
    const appointmentDateTime = new Date(datetimeStr);
    const now = new Date();
    
    return appointmentDateTime > now;
  }

  export const getStatusStyles = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'AGENDADO' || upperStatus === 'PENDENTE') {
      return 'bg-yellow-100 text-yellow-950 font-semibold border border-yellow-500';
    }
    if (upperStatus === 'CANCELADO') {
      return 'bg-red-100 text-red-950 font-semibold border border-red-500';
    }
    if (upperStatus === 'CONCLUÍDO' || upperStatus === 'CONCLUIDO') {
      return 'bg-green-100 text-emerald-950 font-semibold border border-green-500';
    }
    
    return 'bg-gray-300 text-gray-900 font-medium';
  };

  /**
 * Convert date string (YYYY-MM-DD) to Date object in local timezone
 * @param dateStr Date string in YYYY-MM-DD format
 * @returns Date object
 */
  export const formatDateStringToISO = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  export const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  export const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // HH:MM
  };

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

  export function canCancelAppointment(date: string, time: string): boolean {
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

  //   console.log('canCancelAppointment:', {
  //   date,
  //   time,
  //   appointmentDateTime: appointmentDateTime.toLocaleString(),
  //   now: now.toLocaleString(),
  //   canCancel: appointmentDateTime > now
  // });
    
    return appointmentDateTime > now;
}
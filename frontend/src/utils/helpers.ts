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

  export const canCancelAppointment = (date: string, time: string): boolean => {
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
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
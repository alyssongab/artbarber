  export const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  export const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // HH:MM
  };

  export const capitalizeStatus = (stts: string) => {
    switch(stts){
        case "PENDENTE": return "Agendado";
        case "CONCLUIDO": return "Concluído";
        case "CANCELADO": return "Cancelado"
    }
  }
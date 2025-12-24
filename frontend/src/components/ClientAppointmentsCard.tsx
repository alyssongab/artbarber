import { Calendar } from 'lucide-react';
import { getFirstName } from '../utils/users';

interface ClientAppointmentsCardProps {
  id: number;
  service: string;
  barber: string;
  status: string;
  date: string;
  time: string;
  price: string;
}

function ClientAppointmentsCard({
  service,
  barber,
  status,
  date,
  time,
  price,
}: ClientAppointmentsCardProps) {
  const getStatusStyles = (status: string) => {
    const upperStatus = status.toUpperCase();
    
    if (upperStatus === 'PENDENTE') {
      return 'bg-gray-300 text-gray-900';
    }
    if (upperStatus === 'CANCELADO') {
      return 'bg-red-600 text-white';
    }
    if (upperStatus === 'CONCLUÍDO' || upperStatus === 'CONCLUIDO') {
      return 'bg-green-600 text-white';
    }
    
    return 'bg-gray-300 text-gray-900';
  };

  return (
    <div className='flex flex-col bg-white gap-3 justify-center border-[1px] border-black/20 p-3 rounded-lg w-3/4'>
      <h3 className='font-medium text-lg'>{service}</h3>
      <div className='flex justify-between'>
        <p className='opacity-50'>Barbeiro {getFirstName(barber)}</p>
        <p className={`${getStatusStyles(status)} rounded-lg py-1 px-4 text-[12px]`}>
          {status}
        </p>
      </div>
      <div className='flex justify-between'>
        <div className='flex justify-center items-center gap-1'>
          <Calendar size={20} className='opacity-50' />
          <p className='opacity-70'> {date} às {time}</p>
        </div>
        <p className='text-yellow-600'>R$ {price.concat(",00")}</p>
      </div>
    </div>
  );
}

export default ClientAppointmentsCard;
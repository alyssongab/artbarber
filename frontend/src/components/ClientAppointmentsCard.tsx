import { Calendar } from 'lucide-react';
import { getFirstName } from '../utils/users';
import { Ellipsis } from 'lucide-react';
import { useState } from 'react';
import { canCancelAppointment } from '../utils/helpers';
import { appointmentService } from '../services/api';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface ClientAppointmentsCardProps {
  id: number;
  service: string;
  barber: string;
  status: string;
  date: string;
  time: string;
  price: string;
  onCancelled?: () => void;
}

function ClientAppointmentsCard({
  id,
  service,
  barber,
  status,
  date,
  time,
  price,
  onCancelled
}: ClientAppointmentsCardProps) {

  const [showPopover, setShowPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const getStatusStyles = (status: string) => {
    const upperStatus = status.toUpperCase();
    console.log(upperStatus);
    if (upperStatus === 'AGENDADO') {
      return 'bg-gray-300 text-black font-medium';
    }
    if (upperStatus === 'CANCELADO') {
      return 'bg-red-700 text-white font-medium';
    }
    if (upperStatus === 'CONCLUÍDO' || upperStatus === 'CONCLUIDO') {
      return 'bg-green-700 text-white font-medium';
    }
    
    return 'bg-gray-300 text-gray-900 font-medium';
  };

  const canCancel = status.toUpperCase() === 'AGENDADO' && canCancelAppointment(date, time);
  console.log('Card Debug:', {
    id,
    status: status.toUpperCase(),
    date,
    time,
    canCancelResult: canCancelAppointment(date, time),
    canCancel
  });
  const handleOpenConfirmDialog = () => {
    setShowPopover(false);
    setShowConfirmDialog(true);
  };

  const handleCancelAppointment = async () => {
    try {
      setLoading(true);
      setShowConfirmDialog(false);
      await appointmentService.cancelAppointment(id);
      setShowSuccessDialog(true);
    } catch (err: any) {
      console.error('Erro ao cancelar:', err);
      alert(err.response?.data?.message || 'Erro ao cancelar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    onCancelled?.(); // reload the list after closing dialog
  };

  return (
    <div className='hover:shadow-lg transition duration-300 ease-in-out flex flex-col bg-white gap-3 justify-center border-[1px] border-black/20 hover:border-black/50 p-3 rounded-lg w-3/4'>
      <div className='flex justify-between'>
        <h3 className='font-medium text-lg'>{service}</h3>
        {canCancel && (
          <div className='relative'>
            <button
              onClick={() => setShowPopover(!showPopover)}
              className='cursor-pointer rounded-xl hover:bg-gray-200 p-1'
            >
              <Ellipsis />
            </button>

            {showPopover && (
              <div className='absolute right-0 top-8 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 min-w-[150px]'>
                <button
                  onClick={handleOpenConfirmDialog}
                  disabled={loading}
                  className='cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 rounded disabled:opacity-50'
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className='flex justify-between'>
        <p className='opacity-60'>Barbeiro {getFirstName(barber)}</p>
        <p className={`${getStatusStyles(status)} rounded-lg py-1 px-4 text-[12px]`}>
          {status}
        </p>
      </div>
      <div className='flex justify-between'>
        <div className='flex justify-center items-center gap-1'>
          <Calendar size={20} className='opacity-50' />
          <p className='opacity-70'> {date} às {time}</p>
        </div>
        <p className='text-yellow-600 font-medium'>R$ {price.concat(",00")}</p>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Não, manter
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={loading}
            >
              {loading ? 'Cancelando...' : 'Sim, cancelar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendamento cancelado!</DialogTitle>
            <DialogDescription>
              Seu agendamento foi cancelado com sucesso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseSuccessDialog}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientAppointmentsCard;
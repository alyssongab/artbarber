import { getFirstName } from '../../../utils/users';
import { Ellipsis, Calendar, X, User } from 'lucide-react';
import { useState } from 'react';
import { canCancelAppointment, getStatusStyles } from '../../../utils/helpers';
import { appointmentService } from '../../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

interface ClientAppointmentsCardProps {
  id: number;
  service: string;
  barber: string;
  status: string;
  date: string;
  time: string;
  price: string;
  datetime: string; // ISO 8601 datetime
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
  datetime,
  onCancelled
}: ClientAppointmentsCardProps) {

  const [showPopover, setShowPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const canCancel = status.toUpperCase() === 'AGENDADO' && canCancelAppointment(datetime);

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
    <div className='hover:shadow-lg transition duration-300 ease-in-out flex flex-col bg-white gap-3 justify-center border-[1px] border-black/20 hover:border-black/50 p-3 rounded-lg'>
      <div className='flex justify-between'>
        <h3 className='font-medium text-lg'>{service}</h3>
        {canCancel && (
          <Popover open={showPopover} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <button className='cursor-pointer rounded-xl hover:bg-gray-200 p-1'>
                <Ellipsis />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[150px] p-2">
              <button
                onClick={handleOpenConfirmDialog}
                disabled={loading}
                className='cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 rounded disabled:opacity-50'
              >
                <X size={16} />
                Cancelar
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {/* mobile: custom breakpoint */}
      <div className='flex flex-row items-start justify-between'>
        <div className='flex justify-center items-center gap-1'>
          <User size={20} className='opacity-50'/>
          <p className='opacity-60'>Barbeiro {getFirstName(barber)}</p>
        </div>
        <p className={`${getStatusStyles(status)} rounded-lg py-1 px-4 text-[11px] md:text-sm max-w-[120px] text-center`}>
          {status}
        </p>
      </div>
      <div className='flex flex-row justify-between items-start gap-2'>
        <div className='flex justify-center items-center gap-1'>
          <Calendar size={20} className='opacity-50' />
          <p className='opacity-70 text-sm sm:text-base'> {date} às {time}</p>
        </div>
        <p className='text-emerald-700 font-medium'>{price}</p>
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
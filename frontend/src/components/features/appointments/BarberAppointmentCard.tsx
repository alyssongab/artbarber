import { getFirstName } from '../../../utils/users';
import { getStatusStyles } from '../../../utils/helpers';
import { Calendar, User, Phone, Edit } from 'lucide-react';
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

interface BarberAppointmentCardProps {
  id: number;
  service: string;
  client: string;
  clientPhone: string;
  status: string;
  date: string;
  time: string;
  price: string;
  onStatusChanged?: () => void;
}

function BarberAppointmentCard({
  id,
  service,
  client,
  clientPhone,
  status,
  date,
  time,
  price,
  onStatusChanged
}: BarberAppointmentCardProps) {

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Só pode editar se status for PENDENTE/AGENDADO
  const canEdit = status.toUpperCase() === 'PENDENTE' || status.toUpperCase() === 'AGENDADO';

  const handleOpenEditDialog = () => {
    setShowEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      alert('Selecione um status');
      return;
    }

    try {
      setLoading(true);
      setShowEditDialog(false);
      
      await appointmentService.updateAppointmentStatus(id, selectedStatus);
      
      setShowSuccessDialog(true);
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      alert(err.response?.data?.message || 'Erro ao atualizar status do agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setSelectedStatus('');
    onStatusChanged?.(); // reload the list
  };

  return (
    <div className='hover:shadow-lg transition duration-300 ease-in-out flex flex-col bg-white gap-3 justify-center border-[1px] border-black/20 hover:border-black/50 p-3 rounded-lg'>
      <div className='flex justify-between items-start'>
        <div className='flex flex-col gap-1'>
          <h3 className='font-medium text-lg'>{service}</h3>
          <div className='flex items-center gap-2 text-gray-600'>
            <User size={20}/>
            <p>{getFirstName(client)}</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenEditDialog}
            className='cursor-pointer rounded-xl hover:bg-blue-100 p-2 text-blue-600'
            title="Atualizar status"
          >
            <Edit size={20} />
          </button>
        )}
      </div>

      {/* mobile: custom breakpoint */}
      <div className='flex gap-2 flex-row items-start justify-between text-gray-600'>
        <div className='flex justify-center items-center gap-2'>
            <Phone size={16} />
            <span>{clientPhone}</span>
        </div>
        <p className={`${getStatusStyles(status)} rounded-lg py-1 px-4 text-[11px] md:text-sm max-w-[120px] text-center`}>
          {status}
        </p>
      </div>

      <div className='flex flex-row justify-between items-start'>
        <div className='flex justify-center items-center gap-1'>
          <Calendar size={20} className='opacity-50' />
          <p className='opacity-70'>{date} às {time}</p>
        </div>
        <p className='text-emerald-700 font-medium'>{price}</p>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar status do agendamento</DialogTitle>
            <DialogDescription>
              Cliente: {client} - {service}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Novo status:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={loading || !selectedStatus}
            >
              {loading ? 'Atualizando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status atualizado!</DialogTitle>
            <DialogDescription>
              O status do agendamento foi atualizado com sucesso.
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

export default BarberAppointmentCard;

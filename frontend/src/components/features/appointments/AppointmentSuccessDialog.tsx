import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Check } from "lucide-react";
import type { AppointmentResponse } from "../../../types";

interface AppointmentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentResponse | null;
}

function AppointmentSuccessDialog({ open, onClose, appointment }: AppointmentSuccessDialogProps) {
  if (!appointment) return null;

  const formattedDate = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
  const formattedTime = appointment.appointment_time.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Agendamento Confirmado!
          </DialogTitle>
          <DialogDescription className="text-center">
            Seu horário foi reservado com sucesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Serviço:</span>
            <span className="font-medium">{appointment.service.name}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Barbeiro:</span>
            <span className="font-medium">{appointment.barber.full_name}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Horário:</span>
            <span className="font-medium">{formattedTime}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Valor:</span>
            <span className="font-medium text-green-600">R$ {appointment.service.price}</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentSuccessDialog;
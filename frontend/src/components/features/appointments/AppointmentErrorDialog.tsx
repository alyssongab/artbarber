import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { AlertCircle } from "lucide-react";

interface AppointmentErrorDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

function AppointmentErrorDialog({ open, onClose, message }: AppointmentErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Erro ao Agendar
          </DialogTitle>
          <DialogDescription className="text-center">
            {message || 'Não foi possível confirmar seu agendamento. Tente novamente.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full">
            Tentar Novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentErrorDialog;
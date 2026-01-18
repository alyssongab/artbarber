import { BarberResponseDTO} from "../../../types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { UserCircle2 } from "lucide-react";

interface BarberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: BarberResponseDTO[];
  selectedBarberId: string;
  onSelectBarber: (barberId: string) => void;
  disabled?: boolean;
}

export default function BarberSelectionModal({
  isOpen,
  onClose,
  barbers,
  selectedBarberId,
  onSelectBarber,
  disabled = false
}: BarberSelectionModalProps) {

  const handleBarberClick = (barberId: string) => {
    onSelectBarber(barberId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecione um Barbeiro</DialogTitle>
          <DialogDescription>
            Escolha o barbeiro de sua preferência para o atendimento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          {barbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCircle2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum barbeiro disponível no momento.</p>
            </div>
          ) : (
            barbers.map((barber) => (
              <button
                key={barber.user_id}
                onClick={() => handleBarberClick(barber.user_id.toString())}
                disabled={disabled}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                  ${selectedBarberId === barber.user_id.toString() 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* barber Photo */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  {barber.thumbnail_url || barber.photo_url ? (
                    <img
                      src={barber.thumbnail_url || barber.photo_url || ''}
                      alt={barber.full_name}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle2 size={32} className="text-gray-500" />
                    </div>
                  )}
                  
                  {/* selected Indicator */}
                  {selectedBarberId === barber.user_id.toString() && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg 
                        className="w-3 h-3 text-white" 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>

                {/* barber Info */}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{barber.full_name}</p>
                  <p className="text-sm text-gray-500">Barbeiro</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

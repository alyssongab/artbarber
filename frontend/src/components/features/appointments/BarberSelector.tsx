import { BarberResponseDTO } from "../../../types";
import { ChevronRight, UserCircle2 } from "lucide-react";

interface BarberSelectorProps {
  selectedBarber: BarberResponseDTO | null;
  onClick: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function BarberSelector({
  selectedBarber,
  onClick,
  disabled = false,
  placeholder = "Selecione o barbeiro"
}: BarberSelectorProps) {
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2 
        border border-gray-300 rounded-md bg-white
        transition-colors
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
          : 'hover:border-gray-400 cursor-pointer'
        }
      `}
    >
      {selectedBarber ? (
        <div className="flex items-center gap-3 flex-1">
          {/* Barber Thumbnail */}
          <div className="w-10 h-10 flex-shrink-0">
            {selectedBarber.thumbnail_url || selectedBarber.photo_url ? (
              <img
                src={selectedBarber.thumbnail_url || selectedBarber.photo_url || ''}
                alt={selectedBarber.full_name}
                className="w-full h-full rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <UserCircle2 size={20} className="text-gray-500" />
              </div>
            )}
          </div>
          
          <span className="text-sm font-medium text-gray-900 text-left">
            {selectedBarber.full_name}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-500">{placeholder}</span>
      )}
      
      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
    </button>
  );
}

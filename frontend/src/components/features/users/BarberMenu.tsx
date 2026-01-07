import { Calendar } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../../ui/dialog";
import { Calendar as CalendarUI } from "../../ui/calendar";
import { useState } from "react";
import { ptBR } from "date-fns/locale";

interface BarberMenuProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function BarberMenu({ selectedDate, onDateChange }: BarberMenuProps){
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const dateSelected = selectedDate.toLocaleDateString('pt-BR');

    const handleDateSelect = (date: Date | undefined) => {
        if(date) {
            onDateChange(date);
            setIsCalendarOpen(false);
        }
    };
    
    return(
        <div className="flex flex-col bg-white border-1 border-black/20 rounded-sm p-3 gap-3">
            <div className="flex items-center gap-3">
                <Calendar />
                <h2 className="mobile:text-xl font-semibold">Selecionar Data</h2>
            </div>
            <div id="barber-calendar">
                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogTrigger className="cursor-pointer border-1 border-black/20 min-w-full bg-white text-gray-800 text-lg w-full text-start px-4 py-1 rounded-lg hover:border-black/30">
                        <p className="text-base">Data Selecionada: {dateSelected}</p>
                    </DialogTrigger>
                    <DialogContent className="flex justify-center w-fit p-10">
                        <DialogTitle>
                          <CalendarUI
                                mode="single"
                                aria-label="calendario"
                                locale={ptBR}
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="rounded-lg border"
                            />
                        </DialogTitle>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
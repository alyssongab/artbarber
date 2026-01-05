import { Calendar } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "../../ui/dialog";
import { Calendar as CalendarUI } from "../../ui/calendar";
import { useState } from "react";

export default function BarberMenu(){
    const [date, setDate] = useState<Date | undefined>(new Date());
    const dateSelected = date?.toLocaleDateString('pt-BR');
    return(
        <div className="flex flex-col bg-white border-1 border-black/20 rounded-sm p-3 gap-3">
            <div className="flex items-center gap-3">
                <Calendar />
                <h2 className="text-xl font-semibold">Selecionar Data</h2>
            </div>
            <div id="barber-calendar">
                <Dialog>
                    <DialogTrigger className="cursor-pointer border-1 border-black/20 min-w-full bg-white text-gray-800 text-lg w-full text-start px-4 py-1 rounded-lg hover:border-black/30">
                        <p>Data Selecionada: {dateSelected}</p>
                    </DialogTrigger>
                    <DialogContent className="flex justify-center w-fit p-10">
                          <CalendarUI
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-lg border"
                            />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
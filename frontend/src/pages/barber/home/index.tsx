import { Fragment } from "react/jsx-runtime";
import BarberMenu from "../../../components/features/users/BarberMenu";
import { Button } from "../../../components/ui/button";
import { Calendar, Plus } from "lucide-react";

export default function BarberHomePage(){
    return(
        <Fragment>
            <section id="barber-menu">
                <BarberMenu />
            </section>
            <section id="barber-cards" className="mt-4 flex min-w-full gap-4">
                <div id="total-appoints" className="bg-white flex-1 p-2 border border-black/50 rounded-md text-center">
                    <span className="font-bold text-lg">4</span>
                    <p className="text-sm font-medium opacity-50">Total agendamentos</p>
                </div>
                <div id="total-earned" className="bg-white flex-1 p-2 border border-black/50 rounded-md text-center">
                    <span className="font-bold text-lg">R$ 150</span>
                    <p className="text-sm font-medium opacity-50">Receita</p>
                </div>
            </section>
            <section id="barber-buttons" className="mt-4 flex flex-col gap-2">
                <Button className="w-full bg-[#2B964F] hover:bg-[#35b15e]">
                    <Calendar /> Ver agenda
                </Button>
                <Button className="w-full bg-[#C3880A] hover:bg-[#ecb02e]">
                    <Plus /> Agendamento manual
                </Button>
            </section>
        </Fragment>
    )
}
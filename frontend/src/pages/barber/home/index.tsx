import { Fragment } from "react/jsx-runtime";
import BarberMenu from "../../../components/features/users/BarberMenu";
import { Button } from "../../../components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { authService, appointmentService } from "../../../services/api";
import { useEffect, useState } from "react";
import { formatToISOString } from "../../../utils/helpers";

export default function BarberHomePage(){

    const userId = authService.getCurrentUser()?.user_id;
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [totalAppointments, setTotalAppointments] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<string>("0.00");
    const [loading, setLoading] = useState<boolean>(false);

    if(!userId) return;

    const fetchRevenueData = async () => {
        try{
            setLoading(true);
            console.log(selectedDate);
            const dt = formatToISOString(selectedDate);
            console.log(dt);
            const data = await appointmentService.getBarberRevenue(
                userId,
                dt
            );

            setTotalAppointments(data.totalAppointments);
            setTotalRevenue(data.totalRevenue);
        }
        catch(error: any){
            console.log("Erro ao buscar receita: ", error);
        }
        finally{
            setLoading(false);
        }
    } 

    useEffect(() => {
        fetchRevenueData();
    }, [userId, selectedDate]);

    return(
        <Fragment>
            <section id="barber-menu">
                <BarberMenu  
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                />
            </section>
            <section id="barber-cards" className="mt-4 flex min-w-full gap-4">
                <div id="total-appoints" className="bg-white flex-1 p-2 border border-black/50 rounded-md text-center">
                    <span className="font-bold text-lg">
                        {loading ?  'Carregando...' : totalAppointments}
                    </span>
                    <p className="text-sm font-medium opacity-50">Total agendamentos</p>
                </div>
                <div id="total-earned" className="bg-white flex-1 p-2 border border-black/50 rounded-md text-center">
                    <span className="font-bold text-lg">
                        {loading ? 'Carregando...' : totalRevenue}
                    </span>
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
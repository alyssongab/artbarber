import BarberAppointmentCard from "../../../components/features/appointments/BarberAppointmentCard";
import { useState, Fragment, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { appointmentService, authService } from "../../../services/api";
import { formatDate, formatTime, formatToISOStandard, capitalizeStatus } from "../../../utils/helpers";
import { AppointmentResponse, PaginationInfo } from "../../../types";

export default function BarberAgenda() {

    const navigate = useNavigate();
    const location = useLocation();
    const locationDate = location.state?.selectedDate;
    
    // Get date from date (coming from home page) or creates current data
    const [selectedDate] = useState<Date>(() => locationDate ? locationDate : new Date());
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = import.meta.env.VITE_BARBER_PAGINATION || 5;
    
    const dt = selectedDate.toLocaleDateString("pt-BR");
    const userId = authService.getCurrentUser()?.user_id;

    const fetchAppointments = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const dateStr = formatToISOStandard(selectedDate);
            
            const response = await appointmentService.getRelatedAppointments(
                currentPage, PAGE_SIZE, dateStr);
            
            // Filter appointments on selected date
            const filtered = response.data.filter(apt => 
                apt.appointment_date === dateStr
            );
            
            setAppointments(filtered);
            setPagination(response.pagination);
            console.log(response.pagination);
            
        } catch (err: any) {
            console.error('Erro ao buscar agendamentos:', err);
            setError('Erro ao carregar agendamentos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate, currentPage]);

    const handleStatusChanged = () => {
        fetchAppointments();
    };

    const handlePrevPage = () => {
        if (!pagination || currentPage <= 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (!pagination || currentPage >= pagination.totalPages) return;
        setCurrentPage((prev) => prev + 1);
    };
    
    return(
        <Fragment>
            <div id='agenda-nav' className='flex flex-row items-center justify-center relative'>
                <button
                    onClick={() => navigate('/barber/home', { 
                        state: { selectedDate: selectedDate } 
                    })}
                    id='return-barber' 
                    className='bg-black absolute left-0 p-1 rounded-md'
                >
                    <ArrowLeft color='white'/>
                </button>
                <div className='flex gap-2 items-center justify-center'>
                    <h1 className='text-xl md:text-2xl font-medium'>Agenda: {dt}</h1>
                    <Calendar size={24} />
                </div>
            </div>

            <section id="barber-appointments" className="mt-4">
                
                {loading && (
                    <p className="text-center text-gray-500">Carregando...</p>
                )}

                {error && (
                    <p className="text-center text-red-500">{error}</p>
                )}

                {!loading && !error && appointments.length === 0 && (
                    <p className="mt-6 bg-gray-300 p-5 text-md text-center rounded-md">Nenhum agendamento para esta data.</p>
                )}

                {!loading && !error && appointments.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {appointments.map((apt) => (
                            <BarberAppointmentCard
                                key={apt.appointment_id}
                                id={apt.appointment_id}
                                service={apt.service.name}
                                client={apt.client?.full_name || 'Cliente não informado'}
                                clientPhone={apt.client?.phone_number || 'N/A'}
                                status={capitalizeStatus(apt.appointment_status)}
                                date={formatDate(apt.appointment_date)}
                                time={formatTime(apt.appointment_time)}
                                price={apt.service.price}
                                onStatusChanged={handleStatusChanged}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && appointments.length > 0 && pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1 || loading}
                            className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"

                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </button>
                        
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {pagination.totalPages}
                        </span>
                        
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= pagination.totalPages || loading}
                            className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"

                        >
                            Próxima
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </section>
        </Fragment>
    )
}

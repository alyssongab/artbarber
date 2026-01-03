import { Fragment, useEffect, useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { appointmentService } from '../../../services/api';
import { AppointmentResponse, PaginationInfo } from '../../../types';
import { formatDate, formatTime, capitalizeStatus } from '../../../utils/helpers';
import ClientAppointmentsCard from '../../../components/features/appointments/AppointmentCard';

function ClientAppointmentsPage(){

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = import.meta.env.VITE_CLIENT_PAGINATION;

    const fetchAppointments = async () =>{
        try{
            setLoading(true);
            const myAppointments = await appointmentService.getRelatedAppointments(currentPage, PAGE_SIZE);
            setAppointments(myAppointments.data);
            setPagination(myAppointments.pagination);
        }
        catch(err: any){
            setLoading(false);
            console.log("Erro ao carregar agendamentos: ", err);
            setError("Houve um erro ao carregar os agendamentos.");
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAppointments();
    }, [currentPage]);

    const handlePreviousPage = () => {
        if (!pagination || currentPage <= 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (!pagination || currentPage >= pagination.totalPages) return;
        setCurrentPage((prev) => prev + 1);
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Carregando agendamentos...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-600">{error}</p>
        </div>
        );
    }

    const appointmentDetails = appointments.map(a => ({
        id: a.appointment_id,
        service: a.service.name,
        barber: a.barber.full_name,
        status: capitalizeStatus(a.appointment_status),
        date: formatDate(a.appointment_date),
        time: formatTime(a.appointment_time),
        price: a.service.price
    }));

    return(
        <Fragment>
            <div id='appointments-nav' className='flex flex-row items-center justify-center relative'>
                <Link 
                    to="/client/home" 
                    id='return-client' 
                    className='bg-blue-700 absolute left-0  p-1 rounded-md'
                >
                    <ArrowLeft color='white'/>
                </Link>
                <div className='flex gap-2 items-center justify-center'>
                    <h1 className='text-xl md:text-2xl'>Agendamentos</h1>
                    <Calendar size={24} />
                </div>
            </div>
                {appointmentDetails.length === 0
                ?
                    (<p className='bg-gray-300 p-5 text-lg rounded-md'> Você não possui agendamentos ainda. </p>)
                :
                    <div id='my-appointments'>
                        {/* <h2 className='text-xl border-b-2'>Seus agendamentos</h2> */}
                        <div className='flex flex-col items-center justify-start gap-6 mt-6 min-h-[480px]'>
                            {appointmentDetails.map(a => 
                                <ClientAppointmentsCard
                                    key={a.id}
                                    id={a.id}
                                    service={a.service}
                                    barber={a.barber}
                                    status={a.status}
                                    date={a.date}
                                    time={a.time}
                                    price={a.price}
                                    onCancelled={fetchAppointments}
                                />
                            )}
                        </div>
                        {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage <= 1 || loading}
                                className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>

                            <span className="text-sm text-gray-700 font-medium">
                                Página {currentPage} de {pagination.totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= pagination.totalPages || loading}
                                className="cursor-pointer bg-blue-600 text-white px-3 py-1 round disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                    </div>                    
                }
        </Fragment>
    )
}

export default ClientAppointmentsPage;
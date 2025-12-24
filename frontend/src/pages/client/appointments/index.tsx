import { Fragment, useEffect, useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { appointmentService } from '../../../services/api';
import { AppointmentResponse } from '../../../types';
import { formatDate, formatTime, capitalizeStatus } from '../../../utils/helpers';
import ClientAppointmentsCard from '../../../components/ClientAppointmentsCard';

function ClientAppointmentsPage(){

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>();
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);

    useEffect(() => {
        const fetchAppointments = async () =>{
            try{
                setLoading(true);
                const myAppointments = await appointmentService.getRelatedAppointments();
                setAppointments(myAppointments);
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
        fetchAppointments();
    }, []);

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
                <div className='flex gap-1 items-center'>
                    <h1 className='text-2xl'>Agendamentos</h1>
                    <Calendar size={25} />
                </div>
            </div>
                {appointmentDetails.length === 0
                ?
                    (<p className='bg-gray-300 p-5 text-lg rounded-md'> Você não possui agendamentos ainda. </p>)
                :
                    <div id='my-appointments'>
                        {/* <h2 className='text-xl border-b-2'>Seus agendamentos</h2> */}
                        <div className='flex flex-col items-center justify-center gap-6 mt-6'>
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
                                />
                            )}
                        </div>
                    </div>                    
                }
        </Fragment>
    )
}

export default ClientAppointmentsPage;
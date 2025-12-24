import { Fragment, useEffect, useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { appointmentService } from '../../../services/api';
import { AppointmentResponse } from '../../../types';
import { getFirstName } from '../../../utils/users';
import { formatDate, formatTime, capitalizeStatus } from '../../../utils/helpers';

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
                    <div id='my-appointments' className='mt-6 flex flex-col gap-5'>
                        <div id='next-appointments' className='space-y-5'>
                            <h2 className='text-xl border-b-2'>Seus agendamentos</h2>
                            <div className='flex flex-col items-center justify-center gap-3'>
                                {
                                    (appointmentDetails.map(a => 
                                        <div key={a.id} className='flex flex-col bg-white gap-3 justify-center border-[1px] border-black/20 p-3 rounded-lg w-3/4'>
                                            <h3 className='font-medium text-lg'>{a.service}</h3>
                                            <div className='flex justify-between'>
                                                <p className='opacity-50'>Barbeiro {getFirstName(a.barber)}</p>
                                                <p className='bg-gray-300 rounded-lg py-1 px-4 text-[12px]'>{a.status}</p>
                                            </div>
                                            <div className='flex justify-between'>
                                                <div className='flex justify-center items-center gap-1'>
                                                    <Calendar size={20} className='opacity-50' />
                                                    <p className='opacity-70'> {a.date} às {a.time}</p>
                                                </div>
                                                <p className='text-yellow-600' >R$ {a.price.concat(",00")}</p>
                                            </div>
                                        </div>
                                    ))
                                } 
                            </div>
                        </div>
                    </div>                    
                }
        </Fragment>
    )
}

export default ClientAppointmentsPage;
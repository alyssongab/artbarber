import { Fragment } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router';

function ClientAppointmentsPage(){
    return(
        <Fragment>
            <div id='appointments-nav' className='flex flex-row items-center justify-center relative'>
                <Link to="/client/home" id='return-client' className='bg-blue-700 absolute left-0  p-1 rounded-md'>
                    <ArrowLeft color='white'/>
                </Link>
                <div className='flex gap-1 items-center'>
                    <h1 className='text-xl font-medium'>Agendamentos</h1>
                    <Calendar />
                </div>
            </div>
            <div id='my-appointments' className='mt-6'>
                <div id='next-appointments'>
                    <h2 className='text-lg border-b-2'>Próximos</h2>
                </div>
                <div id='appointments-history'>
                    <h2 className='text-lg border-b-2'>Histórico</h2>
                </div>
            </div>
        </Fragment>
    )
}

export default ClientAppointmentsPage;
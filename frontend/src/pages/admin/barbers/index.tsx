import { useEffect, useState } from "react";
import { userService } from "../../../services/api"
import { BarberResponseDTO } from "../../../types";
import { Link } from "react-router";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";

export default function AdminBarbersPage() {

    const [barbers, setBarbers] = useState<BarberResponseDTO[]>([]);

    const fetchBarbers = async () => {
        try{
            const response = await userService.getAllBarbers();
            setBarbers(response);
        }
        catch(err: any) {
            console.error("Erro ao buscar barbeiros: ", err);
        }
    }

    useEffect(() => { fetchBarbers() }, []);

    return(
        <div>
            <div id='barbers-management' className='flex flex-row items-center justify-center relative'>
                <Link 
                    to="/admin/home" 
                    id='return-admin' 
                    className='bg-black absolute left-0  p-1 rounded-md'
                >
                    <ArrowLeft color='white'/>
                </Link>
                <div className='flex gap-2 items-center justify-center'>
                    <h1 className='text-xl md:text-2xl font-medium'>Barbeiros</h1>
                </div>
            </div>
            <div className="mt-6 space-y-4">
                {barbers.map(barber => (
                    <div className="flex justify-between items-center border border-black/20 rounded-md">
                        <div key={barber.user_id} className="flex items-center gap-4 p-4">
                            <img
                                src={barber.thumbnail_url || '/default-avatar.png'}
                                alt={barber.full_name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <p className="font-semibold">Nome: {barber.full_name}</p>
                                <p className="text-sm">Celular: {barber.phone_number}</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-3 p-4" >
                            <button className="cursor-pointer" title="Editar">
                                <SquarePen color="blue"/>
                            </button>
                            <button className="cursor-pointer" title="Remover">
                                <Trash2 color="#D10000"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
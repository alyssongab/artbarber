import { useEffect, useState } from "react";
import { userService } from "../../../services/api"
import { BarberResponseDTO } from "../../../types";

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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Barbeiros</h1>
            <div className="space-y-3">
                {barbers.map(barber => (
                    <div key={barber.user_id} className="border border-black/20 flex items-center gap-4 p-4 rounded">
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
                ))}
            </div>
        </div>
    )
}
// import { ReactNode } from "react";
import { LogOut } from 'lucide-react';
import { useAuth } from "../../contexts/auth.context";
import { Outlet } from "react-router";
import { getFirstName } from '../../utils/users';


function AppLayout(){
    const { logout, user } = useAuth()
    const name = user?.full_name;
    const firstName = getFirstName(name);
    const BARBERSHOP_NAME = import.meta.env.VITE_APP_NAME;

    return (
        <div className="min-h-screen bg-[#F1F1F1] p-5">
            <header id="client-header" className="flex w-full max-w-md sm:max-w-lg mx-auto pb-5 justify-between items-center border-b-2 border-gray-300">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <img
                            src="/Frame.png" 
                            alt="Scissors" 
                            className="w-8 h-8"
                        />
                        <h1 className="text-3xl">{BARBERSHOP_NAME || "Barbearia"}</h1>
                    </div>
                    <span className="text-gray-700">Olá, {firstName}!</span>
                </div>
                <div>
                    <button onClick={logout} className='cursor-pointer'>
                        <LogOut />
                        Sair
                    </button>
                </div>
            </header>
            <main className="pt-5">
                <div className="w-full max-w-md sm:max-w-lg mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default AppLayout;
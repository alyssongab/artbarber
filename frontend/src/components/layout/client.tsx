// import { ReactNode } from "react";
import { LogOut } from 'lucide-react';
import { useAuth } from "../../contexts/auth.context";
import { Outlet } from "react-router";


function ClientLayout(){
    const { logout, user } = useAuth()
    const splittedName: string[] | undefined = user?.full_name.split(' ');
    const firstName = splittedName ? splittedName[0] : user?.full_name;

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
                        <h1 className="text-3xl">Barbearia</h1>
                    </div>
                    <span className="text-gray-700">Olá, {firstName ?? 'Cliente'}!</span>
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

export default ClientLayout;
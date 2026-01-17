import { Fragment } from "react";
import { Link } from "react-router";
import { Users, Scissors } from "lucide-react";

export default function AdminHomePage() {
    return(
        <Fragment>
            <section id="admin-welcome" className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
                <p className="text-gray-600 mt-1">Gerencie barbeiros e serviços</p>
            </section>

            <section id="admin-cards" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    to="/admin/barbers"
                    className="group flex flex-col items-center justify-center gap-4 p-8 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <div className="p-4 rounded-full bg-blue-200 group-hover:bg-blue-300 transition-colors">
                        <Users size={40} className="text-blue-700" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-blue-900">Barbeiros</h2>
                    </div>
                </Link>

                <Link
                    to="/admin/services"
                    className="group flex flex-col items-center justify-center gap-4 p-8 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <div className="p-4 rounded-full bg-green-200 group-hover:bg-green-300 transition-colors">
                        <Scissors size={40} className="text-green-700" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-green-900">Serviços</h2>
                    </div>
                </Link>
            </section>
        </Fragment>
    )
}
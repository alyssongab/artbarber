import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useLocation, useNavigate } from "react-router";
import Login from "../../pages/auth/login";
import Register from "../../pages/auth/register";

function Auth(){
    // Manages tab based on current route (login or register)
    const location = useLocation();
    const navigate = useNavigate();
    const currentTab = location.pathname.includes('register') ? 'register' : 'login';

    return(
        <div className="min-h-screen bg-[#F1F1F1]">
            {/* Header with image on background */}
            <header className="relative min-h-[200px] sm:min-h-[250px] flex items-center justify-center overflow-hidden">
                {/* Bg image with dark overlay */}
                <div className="absolute inset-0">
                    <img 
                        src="/header.jpeg" 
                        alt="Barbearia" 
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>
                
                {/* Centered Content */}
                <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        {/* Scissor icon */}
                        <img 
                            src="/SVGRepo_iconCarrier.svg" 
                            alt="Scissors" 
                            className="w-8 h-8 sm:w-12 sm:h-12"
                        />
                        <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold">
                            Barbearia
                        </h1>
                    </div>
                    <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-md mx-auto">
                        Sua experiência premium começa aqui
                    </p>
                </div>
            </header>

            {/* Main content with forms */}
            <main className="px-4 py-8 min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-400px)]">
                <div className="w-full max-w-md sm:max-w-lg mx-auto">
                    <Tabs 
                        value={currentTab}
                        onValueChange={(val) => {
                            if (val === 'register') navigate('/register');
                            else navigate('/login');
                        }}
                        className="w-full"
                    >
                        <TabsList className="w-full bg-gray-300">
                            <TabsTrigger 
                                value="login" 
                                className="hover:cursor-pointer text-neutral-400 data-[state=active]:text-slate-950 data-[state=active]:bg-white"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger 
                                value="register"
                                className="hover:cursor-pointer text-neutral-400 data-[state=active]:text-slate-950 data-[state=active]:bg-white"
                            >
                                Cadastro
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login" className="mt-2">
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <Login />
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="register" className="mt-2">
                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                <Register />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

export default Auth;
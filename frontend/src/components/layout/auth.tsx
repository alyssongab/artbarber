import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

// Componente para renderizar conteúdo do Login
const LoginContent = () => (
    <div className="text-white">
        <h2 className="text-2xl font-bold mb-4">Fazer Login</h2>
        <p className="text-white/80">
            Entre com suas credenciais para acessar sua conta e agendar seus horários.
        </p>
        <div className="mt-4 p-4 bg-white/10 rounded">
            <p className="text-sm text-white/70">
                📝 Aqui será implementado o formulário de login
            </p>
        </div>
    </div>
);

// Componente para renderizar conteúdo do Cadastro
const RegisterContent = () => (
    <div className="text-white">
        <h2 className="text-2xl font-bold mb-4">Criar Conta</h2>
        <p className="text-white/80">
            Crie sua conta para ter acesso completo aos nossos serviços premium.
        </p>
        <div className="mt-4 p-4 bg-white/10 rounded">
            <p className="text-sm text-white/70">
                📝 Aqui será implementado o formulário de cadastro
            </p>
        </div>
    </div>
);

function Auth(){
    return(
        <div className="min-h-screen bg-[#F1F1F1]">
            {/* Header com imagem de fundo */}
            <header className="relative min-h-[300px] sm:min-h-[350px] flex items-center justify-center overflow-hidden">
                {/* Imagem de fundo com overlay escuro */}
                <div className="absolute inset-0">
                    <img 
                        src="/header.jpeg" 
                        alt="Barbearia" 
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/80"></div>
                </div>
                
                {/* Conteúdo centralizado */}
                <div className="relative z-10 text-center px-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img 
                            src="/SVGRepo_iconCarrier.svg" 
                            alt="Scissors" 
                            className="w-8 h-8 sm:w-12 sm:h-12"
                        />
                        <h1 className="text-white text-4xl sm:text-6xl md:text-7xl font-bold">
                            Barbearia
                        </h1>
                    </div>
                    <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-md mx-auto">
                        Sua experiência premium começa aqui
                    </p>
                </div>
            </header>

            {/* Conteúdo principal com tabs e formulários */}
            <main className="px-4 py-8 min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-400px)]">
                <div className="w-full max-w-md sm:max-w-lg mx-auto">
                    <Tabs defaultValue="login" className="w-full">
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
                            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                                <LoginContent />
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="register" className="mt-2">
                            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
                                <RegisterContent />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

export default Auth;
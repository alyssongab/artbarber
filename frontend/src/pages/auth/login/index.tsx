import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { LoginFormData, loginSchema } from "../../../utils/validations";
import { useAuth } from "../../../contexts/auth.context";
import { useState } from "react";

function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    resetField
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      if(error.response?.status === 401){
        setError('root', {
          type: 'manual',
          message: 'E-mail ou senha inválidos. Verifique e tente novamente',
        });
        resetField("password");
      }
    }
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Bem vindo(a)</h2>
      <p className="text-gray-600 mb-6">
        Entre com suas credenciais para acessar sua conta
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="seu@email.com"
            autoComplete="off"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}  // toggle to see password
              {...register("password")}
              className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                // "eye-off" icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.98 8.223A10.45 10.45 0 0 0 2.25 12C3.3 16.493 7.244 19.75 12 19.75c.97 0 1.91-.138 2.802-.397M6.228 6.228A10.45 10.45 0 0 1 12 4.25c4.756 0 8.7 3.257 9.75 7.75a10.5 10.5 0 0 1-4.043 6.02M6.228 6.228 3 3m3.228 3.228 11.544 11.544M9.75 9.75a3 3 0 0 0 4.5 4.5" />
                </svg>
              ) : (
                //  "eye" icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12C3.3 7.507 7.244 4.25 12 4.25S20.7 7.507 21.75 12C20.7 16.493 16.756 19.75 12 19.75S3.3 16.493 2.25 12Z" />
                  <circle cx="12" cy="12" r="3.25" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Erro geral do formulário */}
        {errors.root && (
          <p className="mb-4 text-sm text-red-500">{errors.root.message}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}

export default Login;
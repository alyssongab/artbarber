
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "../../../utils/validations";
import { useAuth } from "../../../contexts/auth.context";

function Register(){
  const { register: registerUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch (error) {
      // Erro já é tratado no contexto com toast
      console.error('Erro no registro:', error);
    }
  };

  return (
    <div className="text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Criar conta</h2>
      <p className="text-gray-600 mb-6">
        Cadastre-se para começar a agendar seus horários
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            id="first_name"
            type="text"
            {...register("first_name")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Nome obrigatório"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
          )}
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Sobrenome
          </label>
          <input
            id="last_name"
            type="text"
            {...register("last_name")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Sobrenome (Opcional)"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-500">{errors.last_name.message}</p>
          )}
        </div>

        {/* Phone number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            id="phone_number"
            type="tel"
            {...register("phone_number")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="(92) 99999-9999"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-500">{errors.phone_number.message}</p>
          )}
        </div>

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
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
    </div>
  )
}

export default Register;

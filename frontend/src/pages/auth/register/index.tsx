
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerClientSchema } from "../../../utils/validations";
import type { z } from "zod";
import { useAuth } from "../../../contexts/auth.context";
import { RegisterClientRequest } from "../../../types";
import { useNavigate } from "react-router";

function Register(){
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  type RegisterClientInput = z.input<typeof registerClientSchema>;
  type RegisterClientOutput = z.output<typeof registerClientSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterClientInput, any, RegisterClientOutput>({
    resolver: zodResolver(registerClientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone_number: '',
      birthday: '',
    },
  });

  function maskDateToDDMMYYYY(input: string): string {
    const digits = input.replace(/\D/g, '').slice(0, 8); // DDMMYYYY
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd}/${mm}`;
    return `${dd}/${mm}/${yyyy}`;
  }

  function toISODateOrNull(value?: string): string | null {
    if (!value) return null;
    const v = value.trim();
    if (!v) return null;
    let y: string, m: string, d: string;
    if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(v)) {
      const parts = v.split(/[/-]/);
      [d, m, y] = parts;
    } else if (/^\d{4}[/-]\d{2}[/-]\d{2}$/.test(v)) {
      const parts = v.split(/[/-]/);
      [y, m, d] = parts;
    } else {
      return null;
    }
    const di = parseInt(d, 10);
    const mi = parseInt(m, 10);
    const yi = parseInt(y, 10);
    const date = new Date(yi, mi - 1, di);
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() !== yi ||
      date.getMonth() !== mi - 1 ||
      date.getDate() !== di
    )
      return null;
    return `${yi.toString().padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const onSubmit = async (data: RegisterClientOutput) => {
    try {
      const payload: RegisterClientRequest = {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        birthday: toISODateOrNull(data.birthday),
      };
      await registerUser(payload);
      // Após registrar e autenticar com sucesso, redireciona para a página principal
      navigate('/');
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
        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo
          </label>
          <input
            id="full_name"
            type="text"
            {...register("full_name")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Seu nome completo"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-500">{String(errors.full_name.message)}</p>
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
            maxLength={11}
            {...register("phone_number")}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="(92) 99999-9999"
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-500">{String(errors.phone_number.message)}</p>
          )}
        </div>

        {/* Birthday (opcional) */}
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
            Data de nascimento (opcional)
          </label>
          {(() => {
            const birthdayReg = register('birthday');
            return (
              <input
                id="birthday"
                type="text"
                maxLength={10}
                placeholder="01/01/2000"
                {...birthdayReg}
                onChange={(e) => {
                  const masked = maskDateToDDMMYYYY(e.target.value);
                  setValue('birthday', masked, { shouldValidate: true });
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            );
          })()}
          {errors.birthday && (
            <p className="mt-1 text-sm text-red-500">Data inválida</p>
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
            <p className="mt-1 text-sm text-red-500">{String(errors.email.message)}</p>
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
            <p className="mt-1 text-sm text-red-500">{String(errors.password.message)}</p>
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

// import ClientLayout from "../../../components/layout/client";
import { Link } from "react-router";
import { Calendar, Clock8, ClockPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Fragment, useEffect, useState } from "react";
import { getServices } from "../../../services/apiServices";
import type { Service, User } from "../../../types";
import { getBarbers } from "../../../services/apiUsers";

// small reusable Link card
function LinkCard({ to, title, children }: { to: string; title: string; children: React.ReactNode }){
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-4 text-center rounded-lg bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
    >
      {children}
      <h3 className="text-md text-gray-900">{title}</h3>
    </Link>
  );
}

// small reusable select field (keeps same uncontrolled behavior as before)
function SelectField({ id, label, placeholder, items }: { id: string; label: string; placeholder: string; items: Array<{ value: string; label: string }> }){
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="pl-1">{label}</label>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {items.map((it) => (
              <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ClientHomePage() {

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Services
  useEffect(() => {
    const fetchServices = async () => {
      try{
        setLoading(true);
        const data = await getServices();
        setServices(data);
      }
      catch(err) {
        console.error('Erro ao buscar serviços:', err);
        setError('Falha ao carregar serviços.');
      }
      finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  // Barbers
  useEffect(() => {
    const fetchBarbers = async () => {
      try{
        const data = await getBarbers();
        setBarbers(data);
      }
      catch(err){
        console.error('Erro ao buscar barbeiros:', err);
        setError('Falha ao carregar barbeiros.');
      }
      finally {
        setLoading(false);
      }
    }

    fetchBarbers();
  }, [])

  const handleSubmit = () => {
    alert("Ola");
  }

  // Transform services from api into SelectField format
  const serviceItems = services.map(service => ({
    value: service.service_id.toString(),
    label: `${service.name} - R$ ${service.price} (${service.duration}min)`
  }));

  // Transform barbers from API into SelectField format
  const barberItems = barbers.map(barber => ({
    value: barber.user_id.toString(),
    label: barber.full_name
  }));

  // Generate next 7 days dynamically, skipping Sundays
  const dateItems = (() => {
    const items: Array<{ value: string; label: string }> = [];
    const date = new Date();

    while (items.length < 7) {
      const weekdayIndex = date.getDay(); // 0 = Sunday

      if (weekdayIndex !== 0) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });

        items.push({
          value: `${year}-${month}-${day}`,
          label: `${day}/${month}/${year} (${weekday})`
        });
      }

      date.setDate(date.getDate() + 1);
    }

    return items;
  })();

  const timeItems = [
    { value: '09:00', label: '09:00' },
    { value: '10:00', label: '10:00' },
    { value: '14:00', label: '14:00' }
  ];

  return (
    <Fragment>
      <section id="cards-section" className="flex justify-between gap-4">
        <LinkCard to="/client/appointments" title="Histórico de agendamentos">
          <Calendar />
        </LinkCard>

        <LinkCard to="/client/history" title="Próximos agendamentos">
          <Clock8 />
        </LinkCard>
      </section>

      <section id="appointment-section" className="mt-5">
        <div className="flex flex-col gap-3 rounded-md bg-white border-gray-200 p-5 shadow-sm">
          {/* Title */}
          <div className="flex items-center gap-3">
            <ClockPlus />
            <h1 className="text-2xl font-medium">Agendar serviço</h1>
          </div>
          {/* Subtitle */}
          <div>
            <p className="opacity-70 text-sm">Escolha o serviço, barbeiro, data e horário desejado.</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            {loading ? (
              <p className="text-center text-gray-500">Carregando serviços...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                <SelectField id="service" label="Serviço" placeholder="Selecione o serviço" items={serviceItems} />
                <SelectField id="barber" label="Barbeiro" placeholder="Selecione o barbeiro" items={barberItems} />
                <SelectField id="date" label="Data" placeholder="Selecione a data" items={dateItems} />
                <SelectField id="time" label="Horário" placeholder="Selecione o horário" items={timeItems} />
              </>
            )}

            {/* Confirm */}
            <div>
              <Button 
                className="w-full font-bold cursor-pointer bg-green-700 hover:bg-green-500"
                onClick={handleSubmit}
                disabled={loading}
              >
                Confirmar agendamento
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default ClientHomePage;
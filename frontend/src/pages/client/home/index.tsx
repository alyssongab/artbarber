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
import React, { Fragment } from "react";

interface LinkCardProps {
  to: string,
  title: string,
  children: React.ReactNode
}

interface SelectFieldProps {
  id: string,
  label: string,
  placeholder: string,
  items: Array<{value: string, label: string}>
}

// small reusable Link card for history and next appointments
function LinkCard({ to, title, children }: LinkCardProps){
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
function SelectField({ id, label, placeholder, items }: SelectFieldProps){
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
  const handleSubmit = () => {
    alert("Ola");
  }

  const serviceItems = [
    { value: 'crt', label: 'Corte de cabelo' },
    { value: 'brb', label: 'Barba completa' }
  ];

  // for now barber/date/time reuse same sample items; later these should come from API
  const barberItems = serviceItems;
  const dateItems = serviceItems;
  const timeItems = serviceItems;

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
            <p className="opacity-70 text-sm">Escolha o serviço, barbeiro e horário desejado</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            <SelectField id="service" label="Serviço" placeholder="Selecione o serviço" items={serviceItems} />
            <SelectField id="barber" label="Barbeiro" placeholder="Selecione o barbeiro" items={barberItems} />
            <SelectField id="date" label="Data" placeholder="Selecione a data" items={dateItems} />
            <SelectField id="time" label="Horário" placeholder="Selecione o horário" items={timeItems} />

            {/* Confirm */}
            <div>
              <Button 
                className="w-full font-bold cursor-pointer bg-green-700 hover:bg-green-500"
                onClick={handleSubmit}
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
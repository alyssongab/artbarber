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
} from "../../../components/ui/select"

function ClientHomePage() {
  const handleSubmit = () => {
    alert("Ola");
  }

  return (
    <>
      <section id="cards-section" className="flex justify-between gap-4">
        <Link
          to="/client/appointments"
          className="flex flex-col items-center justify-center gap-4 text-center rounded-lg bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          <Calendar />
          <h3 className="text-md text-gray-900">Histórico de agendamentos</h3>
        </Link>

        <Link
          to="/client/history"
          className="flex flex-col items-center justify-center gap-4 text-center group rounded-lg bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          <Clock8 />
          <h3 className="text-md text-gray-900">Próximos agendamentos</h3>
        </Link>
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
            {/* Service */}
            <div className="flex flex-col gap-1">
              <label htmlFor="service" className="pl-1">Serviço</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Serviços</SelectLabel>
                    <SelectItem value="crt">Corte de cabelo</SelectItem>
                    <SelectItem value="brb">Barba completa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Barber */}
            <div className="flex flex-col gap-1">
              <label htmlFor="service" className="pl-1">Barbeiro</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Serviços</SelectLabel>
                    <SelectItem value="crt">Corte de cabelo</SelectItem>
                    <SelectItem value="brb">Barba completa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Date */}
            <div className="flex flex-col gap-1">
              <label htmlFor="service" className="pl-1">Data</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Serviços</SelectLabel>
                    <SelectItem value="crt">Corte de cabelo</SelectItem>
                    <SelectItem value="brb">Barba completa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Time */}
            <div className="flex flex-col gap-1">
              <label htmlFor="service" className="pl-1">Horário</label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Serviços</SelectLabel>
                    <SelectItem value="crt">Corte de cabelo</SelectItem>
                    <SelectItem value="brb">Barba completa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

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
    </>
  );
}

export default ClientHomePage;
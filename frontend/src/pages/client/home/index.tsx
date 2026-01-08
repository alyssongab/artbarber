// import ClientLayout from "../../../components/layout/client";
import { Link } from "react-router";
import { Calendar, ClockPlus } from "lucide-react";
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
import type { CreateAppointmentRequest, Service, User, AppointmentResponse } from "../../../types";
import { appointmentService, authService } from "../../../services/api";
import AppointmentSuccessDialog from "../../../components/features/appointments/AppointmentSuccessDialog";
import AppointmentErrorDialog from "../../../components/features/appointments/AppointmentErrorDialog";

// small reusable Link card
function LinkCard({ to, title, children }: { to: string; title: string; children: React.ReactNode }){
  return (
    <Link
      to={to}
      className="flex text-lg font-medium w-full flex-col items-center justify-center gap-4 text-center rounded-lg bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md focus:outline-none"
    >
      {children}
      <h3 className="text-md text-gray-900">{title}</h3>
    </Link>
  );
}


function ClientHomePage() {

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<User[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // wizard state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Dialogs
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');


  const fetchServices = async () => {
    try{
      setLoading(true);
      const data = await appointmentService.getServices();
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

  const fetchBarbers = async () => {
    try{
      const data = await appointmentService.getBarbers();
      setBarbers(data);
    }
    catch(err: any){
      console.error('Erro ao buscar barbeiros:', err);
      setError('Falha ao carregar barbeiros.');
    }
    finally {
      setLoading(false);
    }
  }

  const fetchAvailableTimes = async () => {
    try{
      setLoadingTimes(true);
      const times = await appointmentService.getAvailableHours({
        appointment_date: selectedDate,
        id_barber: Number(selectedBarber)
      });
      setAvailableTimes(times);
      
      // If no times available for today, automatically select next day
      if (times.length === 0) {
        const today = new Date();
        const selectedDateObj = new Date(selectedDate + 'T00:00:00');
        
        // Check if selected date is today
        if (
          today.getDate() === selectedDateObj.getDate() &&
          today.getMonth() === selectedDateObj.getMonth() &&
          today.getFullYear() === selectedDateObj.getFullYear()
        ) {
          // Find next available date (skip Sundays)
          const nextDate = new Date(today);
          nextDate.setDate(nextDate.getDate() + 1);
          
          while (nextDate.getDay() === 0) {
            nextDate.setDate(nextDate.getDate() + 1);
          }
          
          const day = nextDate.getDate().toString().padStart(2, '0');
          const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
          const year = nextDate.getFullYear();
          
          setSelectedDate(`${year}-${month}-${day}`);
        }
      }
    }
    catch(err: any){
      console.error("Erro ao buscar horários: ", err);
      setError('Falha ao carregar horários disponíveis.');
      setAvailableTimes([]);
    }
    finally{
      setLoadingTimes(false);
    }
  }

  // Services
  useEffect(() => {
    fetchServices();
  }, []);

  // Barbers
  useEffect(() => {
    fetchBarbers();
  }, []);

  // Available times
  useEffect(() => {
      if(!selectedBarber || !selectedDate){
        setAvailableTimes([]);
        return;
      }
      fetchAvailableTimes();
  }, [selectedBarber, selectedDate]);


  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, preencha todos os campos.');
      setShowErrorDialog(true);
      return;
    }

    const currentUser = authService.getCurrentUser();

    const appointmentRequest: CreateAppointmentRequest = {
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      id_barber: Number(selectedBarber),
      id_service: Number(selectedService),
      id_client: currentUser?.user_id
    }

    try{
      setIsSubmitting(true);
      const appointmentResponse = await appointmentService.createAppointment(appointmentRequest);

      // dialog success
      setCreatedAppointment(appointmentResponse);
      setShowSuccessDialog(true);

      // clean all inputs
      setSelectedService('');
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
      setAvailableTimes([]);

    }
    catch(err: any){
      console.log("Erro ao criar agendamento: ", err);
      
      const message = err.response?.data?.message || 'Erro ao realizar agendamento. Tente novamente.';
      setErrorMessage(message);
      setShowErrorDialog(true);
    }
    finally{
      setIsSubmitting(false);
    }

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
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // If it's after 19:30 (business closing time), start from tomorrow
    const startDate = new Date();
    if (currentHour > 19 || (currentHour === 19 && currentMinutes >= 30)) {
      startDate.setDate(startDate.getDate() + 1);
    }

    const date = new Date(startDate);

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

  // Transform available times into SelectField format
  const timeItems = availableTimes.map(time => ({
    value: time,
    label: time
  }));

  return (
    <Fragment>
      <section id="cards-section">
        <LinkCard to="/client/appointments" title="Meus agendamentos">
          <Calendar />
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
                {/* Step 1 - Service */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="service" className="pl-1">Serviço</label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Serviço</SelectLabel>
                        {serviceItems.map((it) => (
                          <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2 - Barber */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="barber" className="pl-1">Barbeiro</label>
                  <Select 
                    value={selectedBarber} 
                    onValueChange={setSelectedBarber}
                    disabled={!selectedService}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={!selectedService ? "Selecione o serviço primeiro" : "Selecione o barbeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Barbeiro</SelectLabel>
                        {barberItems.map((it) => (
                          <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 3 - Date */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="date" className="pl-1">Data</label>
                  <Select 
                    value={selectedDate} 
                    onValueChange={setSelectedDate}
                    disabled={!selectedBarber}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={!selectedBarber ? "Selecione o barbeiro primeiro" : "Selecione a data"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Data</SelectLabel>
                        {dateItems.map((it) => (
                          <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 4 - Time */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="time">Horário</label>
                  <Select
                    value={selectedTime} 
                    onValueChange={setSelectedTime}
                    disabled={!selectedDate || loadingTimes}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        !selectedDate 
                          ? "Selecione a data primeiro" 
                          : loadingTimes 
                            ? "Carregando horários..." 
                            : timeItems.length === 0
                              ? "Sem horários disponíveis"
                              : "Selecione o horário"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Horário</SelectLabel>
                        {timeItems.length === 0 ? (
                          <SelectItem value="none" disabled>Sem horários disponíveis</SelectItem>
                        ) : (
                          timeItems.map((it) => (
                            <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Confirm */}
            <div>
              <Button 
                className="w-full font-bold cursor-pointer bg-green-700 hover:bg-green-500"
                onClick={handleSubmit}
                disabled={loading || !selectedService || !selectedBarber || !selectedDate || !selectedTime}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* info dialogs */}
      <AppointmentSuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        appointment={createdAppointment}
      />

      <AppointmentErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        message={errorMessage}
      />   

    </Fragment>
  );
}

export default ClientHomePage;
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ClockPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { CreateAppointmentRequest, Service, AppointmentResponse } from "../../../types";
import { appointmentService, authService } from "../../../services/api";
import AppointmentSuccessDialog from "../../../components/features/appointments/AppointmentSuccessDialog";
import AppointmentErrorDialog from "../../../components/features/appointments/AppointmentErrorDialog";
import { filterValidTimes } from "../../../utils/filters";

function BarberManualAppointmentPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Dialogs
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<AppointmentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getServices();
      setServices(data);
    } catch (err) {
      console.error('Erro ao buscar serviços:', err);
      setError('Falha ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimes = async (barberId: number) => {
    try {
      setLoadingTimes(true);
      const times = await appointmentService.getAvailableHours({
        appointment_date: currentDate,
        id_barber: barberId
      });
      const validTimes = filterValidTimes(times, currentDate);
      setAvailableTimes(validTimes);
    } catch (err: any) {
      console.error("Erro ao buscar horários: ", err);
      setError('Falha ao carregar horários disponíveis.');
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  useEffect(() => {
    fetchServices();
    
    // Get barber ID and fetch available times
    const currentUser = authService.getCurrentUser();
    if (currentUser?.user_id) {
      fetchAvailableTimes(currentUser.user_id);
    }
  }, []);

  const handleClose = () => {
    navigate('/barber/home');
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedTime) {
      setErrorMessage('Por favor, preencha todos os campos.');
      setShowErrorDialog(true);
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser?.user_id) {
      setErrorMessage('Erro ao obter dados do barbeiro.');
      setShowErrorDialog(true);
      return;
    }

    const appointmentRequest: CreateAppointmentRequest = {
      appointment_date: currentDate,
      appointment_time: selectedTime,
      id_barber: currentUser.user_id,
      id_service: Number(selectedService),
      // id_client is optional for manual appointments
    };

    try {
      setIsSubmitting(true);
      const appointmentResponse = await appointmentService.createAppointment(appointmentRequest);

      // Show success dialog
      setCreatedAppointment(appointmentResponse);
      setShowSuccessDialog(true);

      // Clean all inputs
      setSelectedService('');
      setSelectedTime('');
      
      // Refresh available times
      fetchAvailableTimes(currentUser.user_id);
    } catch (err: any) {
      console.error("Erro ao criar agendamento: ", err);
      
      const message = err.response?.data?.message || 'Erro ao realizar agendamento. Tente novamente.';
      setErrorMessage(message);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform services from api into SelectField format
  const serviceItems = services.map(service => ({
    value: service.service_id.toString(),
    label: `${service.name} - R$ ${service.price} (${service.duration}min)`
  }));

  // Transform available times into SelectField format
  const timeItems = availableTimes.map(time => ({
    value: time,
    label: time
  }));

  // Format current date for display
  const formatDateForDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Fragment>
      <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ClockPlus />
              Agendamento Manual
            </DialogTitle>
            <DialogDescription>
              Registre um agendamento para um cliente sem cadastro.
              Data: {formatDateForDisplay(currentDate)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-4">
            {loading ? (
              <p className="text-center text-gray-500">Carregando serviços...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                {/* Service Selection */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="service" className="pl-1 font-medium">Serviço</label>
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

                {/* Time Selection */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="time" className="pl-1 font-medium">Horário</label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    disabled={loadingTimes}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue 
                        placeholder={
                          loadingTimes 
                            ? "Carregando horários..." 
                            : timeItems.length === 0
                              ? "Sem horários disponíveis hoje"
                              : "Selecione o horário"
                        } 
                      />
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

                {/* Action Buttons */}
                <div className="flex gap-3 mt-2">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 font-bold bg-green-700 hover:bg-green-500"
                    onClick={handleSubmit}
                    disabled={loading || !selectedService || !selectedTime || isSubmitting || timeItems.length === 0}
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Success/Error Dialogs */}
      <AppointmentSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          handleClose(); // Return to home after success
        }}
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

export default BarberManualAppointmentPage;

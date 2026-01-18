import { useEffect, useState } from "react";
import { Service, UpdateServiceDTO } from "../../../types";
import { Link } from "react-router";
import { 
    ArrowLeft, 
    Trash2, 
    Plus, 
    Scissors,
    Clock,
    AlertCircle,
    SquarePen,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { servicesService } from "../../../services/api";
import { formatDuration, formatServiceStatus } from "../../../utils/helpers";

export default function AdminServicesPage() {

    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const response = await servicesService.getAllServices();
            setServices(response);
        } catch(err: any) {
            console.error("Erro ao buscar serviços: ", err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { fetchServices() }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
    });

    const [editFormData, setEditFormData] = useState({
        name: '',
        price: '',
        duration: '',
        service_status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCloseModal = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setFormData({
                name: '',
                price: '',
                duration: '',
            });
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await servicesService.createService({
                name: formData.name,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration)
            });
            
            console.log('Criar serviço:', formData);
            setIsModalOpen(false);
            setFormData({
                name: '',
                price: '',
                duration: '',
            });
            fetchServices();
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenEditModal = (service: Service) => {
        setServiceToEdit(service);
        setEditFormData({
            name: service.name,
            price: service.price.toString(),
            duration: service.duration.toString(),
            service_status: service.service_status,
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = (open: boolean) => {
        setIsEditModalOpen(open);
        if (!open) {
            setServiceToEdit(null);
            setEditFormData({
                name: '',
                price: '',
                duration: '',
                service_status: 'ACTIVE',
            });
        }
    };

    const handleUpdateService = async () => {
        if (!serviceToEdit) return;
        
        setIsUpdating(true);
        try {
            const updateData: UpdateServiceDTO = {};
            
            // include edited fields
            if (editFormData.name !== serviceToEdit.name) {
                updateData.name = editFormData.name;
            }
            if (parseFloat(editFormData.price) !== serviceToEdit.price) {
                updateData.price = parseFloat(editFormData.price);
            }
            if (parseInt(editFormData.duration) !== serviceToEdit.duration) {
                updateData.duration = parseInt(editFormData.duration);
            }
            if (editFormData.service_status !== serviceToEdit.service_status) {
                updateData.service_status = editFormData.service_status;
            }

            await servicesService.updateService(serviceToEdit.service_id, updateData);
            
            setIsEditModalOpen(false);
            setServiceToEdit(null);
            setEditFormData({
                name: '',
                price: '',
                duration: '',
                service_status: 'ACTIVE',
            });
            fetchServices();
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenDeleteModal = (service: Service) => {
        setServiceToDelete(service);
        setError("");
        setIsDeleteModalOpen(true);
    };

    const handleDeleteService = async () => {
        if (!serviceToDelete) return;
        
        setIsDeleting(true);
        setError("");
        try {
            await servicesService.deleteService(serviceToDelete.service_id);
            
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
            setError("");
            fetchServices();
        } catch (error: any) {
            console.error('Erro ao deletar serviço:', error);
            const errorMessage = error.response?.data?.message || 
                                 error.message || 
                                 "Erro ao deletar serviço. Tente novamente.";
            setError(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    return(
        <div>
            <div id='services-management' className='flex flex-row items-center justify-center relative'>
                <Link 
                    to="/admin/home" 
                    id='return-admin' 
                    className='bg-black absolute left-0  p-1 rounded-md'
                >
                    <ArrowLeft color='white'/>
                </Link>
                <div className='flex gap-2 items-center justify-center'>
                    <h1 className='text-xl md:text-2xl font-medium'>Serviços</h1>
                </div>
            </div>
            
            {/* create new service */}
            <div className="mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer w-full bg-black hover:bg-gray-700 focus:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-3 border-2"
                >
                    <Plus size={24} />
                    <span className="text-lg">Adicionar Novo Serviço</span>
                </button>
            </div>

            {/* dialog to add new service */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo serviço. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isSubmitting ? (
                        <LoadingSpinner message="Criando serviço..." fullScreen={false} />
                    ) : (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="name" className="text-right">
                                        Nome
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Corte de cabelo"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="price" className="text-right">
                                        Preço (R$)
                                    </label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="50.00"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="duration" className="text-right">
                                        Duração (min)
                                    </label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder="30"
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleCloseModal(false)} 
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    Salvar
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* services list */}
            {isLoading ? (
                <LoadingSpinner message="Carregando serviços..." fullScreen={false} />
            ) : (
                <div className="mt-6 space-y-4">
                    {services.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Scissors size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Nenhum serviço cadastrado ainda.</p>
                            <p className="text-sm">Clique no botão acima para adicionar o primeiro serviço.</p>
                        </div>
                    ) : (
                        services.map(service => (
                            <div key={service.service_id} className="flex justify-between items-center border border-black/20 rounded-md">
                                <div className="flex items-center gap-4 p-2 sm:p-4">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Scissors size={32} className="text-gray-600" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="font-semibold flex items-center gap-2">
                                            {service.name}
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            {formatPrice(service.price)}
                                        </p>
                                        <p className="text-sm flex items-center gap-2">
                                            <Clock size={15} opacity="50%"/>
                                            {formatDuration(service.duration)}
                                        </p>
                                        <span className={formatServiceStatus(service.service_status).className}>
                                            {formatServiceStatus(service.service_status).label}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2 p-3 sm:p-4" >
                                    <button 
                                        className="cursor-pointer hover:opacity-70 transition-opacity" 
                                        title="Editar"
                                        onClick={() => handleOpenEditModal(service)}
                                    >
                                        <SquarePen color="#0066CC"/>
                                    </button>
                                    <button 
                                        className="cursor-pointer hover:opacity-70 transition-opacity" 
                                        title="Remover"
                                        onClick={() => handleOpenDeleteModal(service)}
                                    >
                                        <Trash2 color="#D10000"/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* service edition modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Serviço</DialogTitle>
                        <DialogDescription>
                            Edite as informações do serviço <strong>{serviceToEdit?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isUpdating ? (
                        <LoadingSpinner message="Atualizando serviço..." fullScreen={false} />
                    ) : (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="edit-name" className="text-sm font-medium">
                                        Nome do Serviço *
                                    </label>
                                    <input
                                        id="edit-name"
                                        type="text"
                                        placeholder="Ex: Corte de cabelo"
                                        value={editFormData.name}
                                        onChange={handleEditInputChange}
                                        name="name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="edit-price" className="text-sm font-medium">
                                        Preço (R$) *
                                    </label>
                                    <input
                                        id="edit-price"
                                        type="number"
                                        placeholder="Ex: 30.00"
                                        value={editFormData.price}
                                        onChange={handleEditInputChange}
                                        name="price"
                                        min="10"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="edit-duration" className="text-sm font-medium">
                                        Duração (minutos) *
                                    </label>
                                    <input
                                        id="edit-duration"
                                        type="number"
                                        placeholder="Ex: 30"
                                        value={editFormData.duration}
                                        onChange={handleEditInputChange}
                                        name="duration"
                                        min="15"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="edit-service-status" className="text-sm font-medium">
                                        Status *
                                    </label>
                                    <select
                                        id="edit-service-status"
                                        value={editFormData.service_status}
                                        onChange={handleEditInputChange}
                                        name="service_status"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleCloseEditModal(false)}
                                    disabled={isUpdating}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleUpdateService}
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Salvar Alterações
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* deletion modal confirmation */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Deleção</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o serviço <strong>{serviceToDelete?.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isDeleting ? (
                        <LoadingSpinner message="Deletando serviço..." fullScreen={false} />
                    ) : (
                        <>
                            {error && (
                                <div className="flex items-start gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteService}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Deletar
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

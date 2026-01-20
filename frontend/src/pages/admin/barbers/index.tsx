import { useEffect, useState } from "react";
import { userService } from "../../../services/api"
import { BarberResponseDTO } from "../../../types";
import { Link } from "react-router";
import { 
    ArrowLeft, 
    // SquarePen, 
    Trash2, 
    Plus, 
    User, 
    X,
    Phone
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

export default function AdminBarbersPage() {

    const [barbers, setBarbers] = useState<BarberResponseDTO[]>([]);

    const fetchBarbers = async () => {
        try{
            const response = await userService.getAllBarbers();
            setBarbers(response);
        }
        catch(err: any) {
            console.error("Erro ao buscar barbeiros: ", err);
        }
    }

    useEffect(() => { fetchBarbers() }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [barberToDelete, setBarberToDelete] = useState<BarberResponseDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        photo: null as File | null,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (name === 'photo' && files && files[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, photo: file }));
            
            // Create image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        // clean input file
        const fileInput = document.getElementById('photo') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleCloseModal = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // Reset fields after closing
            setFormData({
                full_name: '',
                email: '',
                phone_number: '',
                password: '',
                photo: null,
            });
            setPhotoPreview(null);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('full_name', formData.full_name);
            submitData.append('email', formData.email);
            submitData.append('phone_number', formData.phone_number);
            submitData.append('password', formData.password);
            if (formData.photo) {
                submitData.append('photo', formData.photo);
            }

            await userService.createBarber(submitData);
            setIsModalOpen(false);
            setFormData({
                full_name: '',
                email: '',
                phone_number: '',
                password: '',
                photo: null,
            });
            setPhotoPreview(null);
            fetchBarbers();
        } catch (error) {
            console.error('Erro ao criar barbeiro:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDeleteModal = (barber: BarberResponseDTO) => {
        setBarberToDelete(barber);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteBarber = async () => {
        if (!barberToDelete) return;
        
        setIsDeleting(true);
        try {
            await userService.deleteBarber(barberToDelete.user_id);
            setIsDeleteModalOpen(false);
            setBarberToDelete(null);
            fetchBarbers();
        } catch (error) {
            console.error('Erro ao deletar barbeiro:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return(
        <div>
            <div id='barbers-management' className='flex flex-row items-center justify-center relative'>
                <Link 
                    to="/admin/home" 
                    id='return-admin' 
                    className='bg-black absolute left-0  p-1 rounded-md'
                >
                    <ArrowLeft color='white'/>
                </Link>
                <div className='flex gap-2 items-center justify-center'>
                    <h1 className='text-xl md:text-2xl font-medium'>Barbeiros</h1>
                </div>
            </div>
            
            {/* create new barber */}
            <div className="mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="cursor-pointer w-full bg-black hover:bg-gray-700 focus:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-3 border-2"
                >
                    <Plus size={24} />
                    <span className="text-lg">Adicionar Novo Barbeiro</span>
                </button>
            </div>


            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Barbeiro</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo barbeiro. Clique em salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isSubmitting ? (
                        <LoadingSpinner message="Criando barbeiro..." fullScreen={false} />
                    ) : (
                        <>
                            <div className="grid gap-4 py-4">
                        {/* photo field with preview */}
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="relative">
                                <div className="w-64 h-64 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={80} className="text-gray-400" />
                                    )}
                                </div>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
                                        title="Remover foto"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <label
                                    htmlFor="photo"
                                    className="absolute bottom-2 right-2 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-lg"
                                    title="Selecionar foto"
                                >
                                    <Plus size={24} />
                                </label>
                            </div>
                            <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500">Clique no + para adicionar foto do barbeiro</p>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="full_name" className="text-right">
                                Nome Completo
                            </label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Barbeiro fulano"
                                autoComplete="off"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="email" className="text-right">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="barbeiro@barber.com"
                                className="col-span-3"
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="phone_number" className="text-right">
                                Telefone
                            </label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                placeholder="(11) 99999-9999"
                                className="col-span-3"
                                autoComplete="off"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="password" className="text-right">
                                Senha
                            </label>
                            <Input
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="col-span-3"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => handleCloseModal(false)} disabled={isSubmitting}>
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

            <div className="mt-6 space-y-4">
                {barbers.map(barber => (
                    <div key={barber.user_id} className="flex justify-between items-center border border-black/20 rounded-md">
                        <div className="flex items-center gap-4 p-2 sm:p-4">
                            <img
                                src={barber.thumbnail_url || '/default-avatar.png'}
                                alt={barber.full_name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold flex items-center gap-2">
                                    <User size={15} opacity="50%"/>
                                    {barber.full_name}
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    <Phone size={15} opacity="50%"/>
                                    {barber.phone_number}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 p-3 sm:p-4" >
                            {/* <button className="cursor-pointer" title="Editar">
                                <SquarePen color="blue"/>
                            </button> */}
                            <button 
                                className="cursor-pointer hover:opacity-70 transition-opacity" 
                                title="Remover"
                                onClick={() => handleOpenDeleteModal(barber)}
                            >
                                <Trash2 color="#D10000"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* deletion confirmation modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Deleção</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o barbeiro <strong>{barberToDelete?.full_name}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isDeleting ? (
                        <LoadingSpinner message="Deletando barbeiro..." fullScreen={false} />
                    ) : (
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
                                onClick={handleDeleteBarber}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Deletar
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
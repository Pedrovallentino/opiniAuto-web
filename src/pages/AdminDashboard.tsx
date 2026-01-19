import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Car } from '../types';
import { Button } from '../components/ui/Button';
import { CarForm } from '../components/CarForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Edit, Plus, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | undefined>(undefined);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      setCars(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar carros.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCar(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este carro?')) return;
    try {
      await api.delete(`/cars/${id}`);
      toast.success('Carro excluído.');
      fetchCars();
    } catch (error) {
      toast.error('Erro ao excluir carro.');
    }
  };

  const handleToggleActive = async (car: Car) => {
    try {
      // Assuming PUT /cars/:id/activate or simple PUT update
      // Or maybe there is a specific endpoint?
      // "Ativação/Inativação de carros"
      // Often PATCH /cars/:id { active: !active }
      await api.patch(`/cars/${car.id}`, { active: !car.active });
      toast.success(`Carro ${car.active ? 'inativado' : 'ativado'}.`);
      fetchCars();
    } catch (error) {
      // Fallback: try PUT with full data if PATCH fails?
      // No, let's assume standard PATCH or PUT.
      toast.error('Erro ao alterar status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Carros</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Carro
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCar ? 'Editar Carro' : 'Novo Carro'}</DialogTitle>
          </DialogHeader>
          <CarForm 
            car={editingCar} 
            onSuccess={() => { setIsModalOpen(false); fetchCars(); }} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Carro</th>
                <th className="px-6 py-3 font-medium">Ano</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center">Carregando...</td></tr>
              ) : cars.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum carro cadastrado.</td></tr>
              ) : (
                cars.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={car.image_url} alt={car.model} className="w-10 h-10 rounded object-cover bg-gray-200" />
                      <div>
                        <div className="font-medium text-gray-900">{car.brand}</div>
                        <div className="text-gray-500">{car.model}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{car.year}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        car.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {car.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(car)} title={car.active ? "Inativar" : "Ativar"}>
                         <Power className={`w-4 h-4 ${car.active ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(car)} title="Editar">
                         <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(car.id)} title="Excluir">
                         <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

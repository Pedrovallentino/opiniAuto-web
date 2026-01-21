import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Car } from '../types';
import { CarCard } from '../components/CarCard';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';

export function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars');
      
      // Adapt backend data (Portuguese) to frontend model (English)
      const backendCars = response.data.cars || [];
      
      const mappedCars: Car[] = backendCars.map((item: any) => ({
        id: item.id,
        brand: item.marca,
        model: item.modelo,
        year: item.ano,
        image_url: item.imagem,
        active: item.status === 'ATIVO',
        created_at: item.criadoEm
      }));

      const activeCars = mappedCars.filter(c => c.active);
      setCars(activeCars);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCars = cars.filter(car => 
    car.brand.toLowerCase().includes(search.toLowerCase()) || 
    car.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Carros Disponíveis</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por marca ou modelo..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-lg border border-dashed">
          <p>Nenhum carro encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}

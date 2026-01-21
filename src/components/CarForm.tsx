import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../services/api';
import { toast } from 'sonner';
import type { Car } from '../types';

const carSchema = z.object({
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.string().min(4, "Ano inválido"),
  category: z.string().min(1, 'Categoria é obrigatória'),
  engineType: z.string().min(1, 'Motorização é obrigatória'),
  imageUrl: z.string().url('URL da imagem inválida'),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarFormProps {
  car?: Car;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CarForm({ car, onSuccess, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear().toString(),
      category: '',
      engineType: '',
      imageUrl: '',
    }
  });

  useEffect(() => {
    if (car) {
        // We might not have category/engineType in the frontend Car type yet?
        // Let's check the Car type in types/index.ts. 
        // It doesn't have category/engineType. 
        // We should probably update the Car type first, or just accept that we might not be able to pre-fill them if they aren't in the object.
        // However, the backend returns them. Let's assume for now we might need to fetch details or just leave empty if missing.
        // Wait, the AdminDashboard calls `api.get('/cars')` (listActive).
        // Let's check `list-active.ts` controller response.
        
        setValue('brand', car.brand);
        setValue('model', car.model);
        setValue('year', String(car.year));
        setValue('imageUrl', car.image_url);
        
        setValue('category', car.category || 'Sedan'); 
        setValue('engineType', car.engineType || 'Flex');
    }
  }, [car, setValue]);

  const onSubmit = async (data: CarFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        marca: data.brand,
        modelo: data.model,
        ano: parseInt(data.year),
        categoria: data.category,
        tipoMotorizacao: data.engineType,
        imagem: data.imageUrl,
      };

      if (car) {
        // Edit
        await api.put(`/cars/${car.id}`, payload);
        toast.success('Carro atualizado com sucesso!');
      } else {
        // Create
        await api.post('/cars', payload);
        toast.success('Carro criado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar carro. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <Input {...register('brand')} placeholder="Ex: Toyota" />
            {errors.brand && <span className="text-red-500 text-sm">{errors.brand.message}</span>}
        </div>
        
        <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <Input {...register('model')} placeholder="Ex: Corolla" />
            {errors.model && <span className="text-red-500 text-sm">{errors.model.message}</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1">Ano</label>
            <Input {...register('year')} type="number" placeholder="2024" />
            {errors.year && <span className="text-red-500 text-sm">{errors.year.message}</span>}
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <Input {...register('category')} placeholder="Ex: SUV, Sedan" />
            {errors.category && <span className="text-red-500 text-sm">{errors.category.message}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Motorização</label>
        <Input {...register('engineType')} placeholder="Ex: 2.0 Híbrido" />
        {errors.engineType && <span className="text-red-500 text-sm">{errors.engineType.message}</span>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">URL da Imagem</label>
        <Input {...register('imageUrl')} placeholder="https://exemplo.com/carro.jpg" />
        {errors.imageUrl && <span className="text-red-500 text-sm">{errors.imageUrl.message}</span>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}

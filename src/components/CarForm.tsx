import { useState } from 'react';
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
  image: z.any().optional(),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarFormProps {
  car?: Car;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CarForm({ car, onSuccess, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: car?.brand || '',
      model: car?.model || '',
      year: String(car?.year || new Date().getFullYear()),
    }
  });

  const onSubmit = async (data: CarFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('brand', data.brand);
      formData.append('model', data.model);
      formData.append('year', data.year);
      
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      if (car) {
        // Edit
        await api.put(`/cars/${car.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Carro atualizado com sucesso!');
      } else {
        // Create
        if (!data.image || !data.image.length) {
            toast.error("Imagem é obrigatória para criar um carro.");
            setIsSubmitting(false);
            return;
        }
        await api.post('/cars', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
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
      
      <div>
        <label className="block text-sm font-medium mb-1">Ano</label>
        <Input {...register('year')} type="number" placeholder="2024" />
        {errors.year && <span className="text-red-500 text-sm">{errors.year.message}</span>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Imagem do Carro</label>
        <Input {...register('image')} type="file" accept="image/*" className="cursor-pointer" />
        {errors.image && <span className="text-red-500 text-sm">{String(errors.image.message)}</span>}
        {car && <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a imagem atual.</p>}
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

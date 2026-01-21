import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/Button';
import { Star } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const reviewSchema = z.object({
  rating_performance: z.number().min(1, "Avalie o desempenho").max(5),
  rating_comfort: z.number().min(1, "Avalie o conforto").max(5),
  rating_consumption: z.number().min(1, "Avalie o consumo").max(5),
  rating_design: z.number().min(1, "Avalie o design").max(5),
  rating_cost_benefit: z.number().min(1, "Avalie o custo-benefício").max(5),
  comment: z.string().min(10, 'O comentário deve ter pelo menos 10 caracteres'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  carId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ carId, onSuccess, onCancel }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, register, handleSubmit, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating_performance: 0,
      rating_comfort: 0,
      rating_consumption: 0,
      rating_design: 0,
      rating_cost_benefit: 0,
      comment: '',
    }
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      // POST /cars/:carId/evaluations
      await api.post(`/cars/${carId}/evaluations`, { 
        notaDesempenho: data.rating_performance,
        notaConforto: data.rating_comfort,
        notaConsumo: data.rating_consumption,
        notaDesign: data.rating_design,
        notaCustoBeneficio: data.rating_cost_benefit,
        comentario: data.comment
      });
      toast.success('Avaliação enviada com sucesso!');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        toast.error('Você já avaliou este carro.');
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (name: keyof ReviewFormData, label: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    (value as number) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      />
      {errors[name] && <span className="text-red-500 text-xs">{errors[name]?.message}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderStars('rating_performance', 'Desempenho')}
        {renderStars('rating_comfort', 'Conforto')}
        {renderStars('rating_consumption', 'Consumo')}
        {renderStars('rating_design', 'Design')}
        {renderStars('rating_cost_benefit', 'Custo-Benefício')}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Comentário</label>
        <textarea
          {...register('comment')}
          className="w-full rounded-md border border-gray-300 p-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Conte sua experiência com o carro..."
        />
        {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </div>
    </form>
  );
}

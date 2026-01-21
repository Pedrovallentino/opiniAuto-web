import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Car, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StarRating } from '../components/StarRating';
import { ReviewForm } from '../components/ReviewForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    if (id) fetchCarData();
  }, [id]);

  const fetchCarData = async () => {
    try {
      // Try to get car details
      const carRes = await api.get(`/cars/${id}`);
      
      const backendCar = carRes.data.car;
      const mappedCar: Car = {
        id: backendCar.id,
        brand: backendCar.marca,
        model: backendCar.modelo,
        year: backendCar.ano,
        image_url: backendCar.imagem,
        active: backendCar.status === 'ATIVO',
        created_at: backendCar.criadoEm,
        category: backendCar.categoria,
        engineType: backendCar.tipoMotorizacao
      };
      
      setCar(mappedCar);

      // Try to get reviews. Check if they are in carRes or need separate fetch
      if (backendCar.avaliacao && Array.isArray(backendCar.avaliacao) && backendCar.avaliacao.length > 0) {
        console.log('Avaliações já incluídas na resposta:', backendCar.avaliacao);
        const mappedReviews: Review[] = backendCar.avaliacao.map((review: any) => ({
          id: review.id,
          rating_performance: review.notaDesempenho,
          rating_comfort: review.notaConforto,
          rating_consumption: review.notaConsumo,
          rating_design: review.notaDesign,
          rating_cost_benefit: review.notaCustoBeneficio,
          comment: review.comentario,
          user_id: review.usuarioId,
          car_id: review.carroId,
          created_at: review.criadoEm,
          user: review.usuario ? {
            id: review.usuario.id,
            name: review.usuario.nome,
            email: review.usuario.email
          } : undefined
        }));
        setReviews(mappedReviews);
      } else {
        // Fallback to fetch reviews separately
          try {
          const reviewsRes = await api.get(`/cars/${id}/evaluations`);
          console.log('Avaliações recebidas (fallback):', reviewsRes.data.evaluations);
          
          const mappedReviews: Review[] = reviewsRes.data.evaluations.map((review: any) => ({
            id: review.id,
            rating_performance: review.notaDesempenho,
            rating_comfort: review.notaConforto,
            rating_consumption: review.notaConsumo,
            rating_design: review.notaDesign,
            rating_cost_benefit: review.notaCustoBeneficio,
            comment: review.comentario,
            user_id: review.usuarioId,
            car_id: review.carroId,
            created_at: review.criadoEm,
            user: review.usuario ? {
              id: review.usuario.id,
              name: review.usuario.nome,
              email: review.usuario.email
            } : undefined
          }));
          
          setReviews(mappedReviews);
        } catch (err) {
            console.log("Could not fetch reviews separately");
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 400 || error.response?.status === 404) {
        toast.error("Carro não encontrado ou ID inválido.");
      } else {
        toast.error("Erro ao carregar detalhes do carro.");
      }
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    try {
      // Endpoint correto para exclusão de avaliação
      await api.delete(`/evaluations/${reviewId}`);
      toast.success('Comentário excluído com sucesso!');
      
      // Atualiza a lista removendo o item excluído
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      toast.error('Erro ao excluir avaliação.');
    }
  };

  if (isLoading) return <div className="p-20 text-center">Carregando...</div>;
  if (!car) return <div className="p-20 text-center">Carro não encontrado.</div>;

  const calculateMetric = (key: keyof Review) => {
      if (!reviews.length) return 0;
      return reviews.reduce((acc, r) => acc + (Number(r[key]) || 0), 0) / reviews.length;
  };

  const calculateOverallAverage = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => {
      const reviewAvg = (
        Number(review.rating_performance) +
        Number(review.rating_comfort) +
        Number(review.rating_consumption) +
        Number(review.rating_design) +
        Number(review.rating_cost_benefit)
      ) / 5;
      return acc + reviewAvg;
    }, 0);
    return sum / reviews.length;
  };

  const overallAverage = calculateOverallAverage();
  console.log('Overall Average:', overallAverage);

  const metrics = [
     { label: 'Desempenho', value: calculateMetric('rating_performance') },
     { label: 'Conforto', value: calculateMetric('rating_comfort') },
     { label: 'Consumo', value: calculateMetric('rating_consumption') },
     { label: 'Design', value: calculateMetric('rating_design') },
     { label: 'Custo-Benefício', value: calculateMetric('rating_cost_benefit') },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
         <div className="md:flex">
           <div className="md:w-1/2 bg-gray-200 relative">
             <img 
                src={car.image_url} 
                alt={car.model} 
                className="w-full h-full object-cover min-h-[300px]" 
                onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400?text=Sem+Imagem'} 
             />
           </div>
           <div className="p-6 md:w-1/2 space-y-6">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">{car.brand} {car.model}</h1>
               <div className="flex flex-col text-gray-500 mt-2 gap-1">
                 <span className="text-xl">Ano: {car.year}</span>
                 {car.category && <span>Categoria: {car.category}</span>}
                 {car.engineType && <span>Motorização: {car.engineType}</span>}
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <span className="text-4xl font-bold text-gray-900">{overallAverage.toFixed(1)}</span>
               <div className="flex flex-col">
                   <StarRating rating={overallAverage} size="lg" />
                   <span className="text-sm text-gray-500">{reviews.length} avaliações</span>
               </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t">
               {metrics.map(m => (
                 <div key={m.label}>
                   <div className="flex justify-between text-sm mb-1">
                     <span className="text-gray-600">{m.label}</span>
                     <span className="font-bold">{m.value.toFixed(1)}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(m.value / 5) * 100}%` }}></div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>
          {isAuthenticated ? (
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogTrigger asChild>
                <Button>Avaliar Carro</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Avaliar {car.brand} {car.model}</DialogTitle>
                </DialogHeader>
                <ReviewForm 
                   carId={car.id} 
                   onSuccess={() => { setIsReviewOpen(false); fetchCarData(); }} 
                   onCancel={() => setIsReviewOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          ) : (
             <div className="text-sm text-gray-500">
                Faça login para avaliar.
             </div>
          )}
        </div>

        <div className="space-y-4">
           {reviews.length === 0 ? (
             <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                <p>Este carro ainda não possui avaliações. Seja o primeiro a avaliar!</p>
             </div>
           ) : (
             reviews.map(review => (
               <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                     </div>
                     <div>
                        <div className="font-semibold text-gray-900">{review.user?.name || 'Usuário'}</div>
                        <div className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</div>
                     </div>
                   </div>
                   {user?.id === review.user_id && (
                     <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteReview(review.id)} title="Excluir avaliação">
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   )}
                 </div>
                 
                 <div className="flex flex-wrap gap-2 mb-4">
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">Desempenho: <b>{review.rating_performance}</b></div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">Conforto: <b>{review.rating_comfort}</b></div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">Consumo: <b>{review.rating_consumption}</b></div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">Design: <b>{review.rating_design}</b></div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">Custo-Ben: <b>{review.rating_cost_benefit}</b></div>
                 </div>

                 <p className="text-gray-700 leading-relaxed">{review.comment}</p>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

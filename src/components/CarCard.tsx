import { Link } from 'react-router-dom';
import type { Car } from '../types';
import { Star } from 'lucide-react';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Link to={`/cars/${car.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
          <img 
            src={car.image_url} 
            alt={`${car.brand} ${car.model}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
               e.currentTarget.src = 'https://placehold.co/600x400?text=Sem+Imagem';
            }}
          />
          {car.average_rating !== undefined && car.average_rating > 0 && (
             <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{Number(car.average_rating).toFixed(1)}</span>
             </div>
          )}
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {car.brand} {car.model}
          </h3>
          <p className="text-gray-500 text-sm">{car.year}</p>
        </div>
      </div>
    </Link>
  );
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  image_url: string;
  average_rating?: number;
  active: boolean;
  created_at?: string;
  category?: string;
  engineType?: string;
}

export interface Review {
  id: string;
  user_id: string;
  car_id: string;
  rating_performance: number;
  rating_comfort: number;
  rating_consumption: number;
  rating_design: number;
  rating_cost_benefit: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CarMetrics {
  average: number;
  performance: number;
  comfort: number;
  consumption: number;
  design: number;
  cost_benefit: number;
  total_reviews: number;
}

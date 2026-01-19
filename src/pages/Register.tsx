import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Cadastro realizado com sucesso! Faça login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Cadastro</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Nome</label>
          <Input {...register('name')} placeholder="Seu nome" />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <Input {...register('email')} type="email" placeholder="seu@email.com" />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Senha</label>
          <Input {...register('password')} type="password" placeholder="******" />
          {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Confirmar Senha</label>
          <Input {...register('confirmPassword')} type="password" placeholder="******" />
          {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        Já tem uma conta? <Link to="/login" className="text-blue-600 hover:underline">Faça login</Link>
      </div>
    </div>
  );
}

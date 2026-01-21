import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/sessions', {
        email: data.email,
        senha: data.password,
      });
      const { token, user } = response.data;
      
      // Map backend user to frontend User type
      const mappedUser = {
        id: user.id,
        name: user.nome,
        email: user.email,
        role: user.perfil,
      };

      login(token, mappedUser);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        Não tem uma conta? <Link to="/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
      </div>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Car, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Car className="h-6 w-6" />
          <span>OpiniAuto</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Carros
          </Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                  Painel Admin
                </Link>
              )}
              
              <div className="flex items-center gap-4 border-l pl-4 ml-2">
                <span className="text-sm text-gray-600 hidden md:inline-block">
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

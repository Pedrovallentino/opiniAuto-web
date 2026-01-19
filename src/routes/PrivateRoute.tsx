import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
      return (
          <div className="flex justify-center items-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

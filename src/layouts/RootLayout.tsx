import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Toaster } from 'sonner'; // Will install sonner for toasts

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 w-full max-w-7xl">
        <Outlet />
      </main>
      <footer className="border-t py-8 bg-white text-center text-sm text-gray-500 mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} OpiniAuto. Projeto Acadêmico.</p>
        </div>
      </footer>
      <Toaster position="top-right" />
    </div>
  );
}

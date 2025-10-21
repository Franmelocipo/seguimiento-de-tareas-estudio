import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LogIn, Database } from 'lucide-react';
import { initializeDatabase } from '../../lib/firebase/initializeData';
import { isDemoMode } from '../../lib/firebase/config';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const { signIn } = useAuth();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      addNotification('success', 'Sesión iniciada correctamente');
    } catch (error) {
      console.error('Login error:', error);
      addNotification(
        'error',
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDatabase = async () => {
    if (!confirm('¿Deseas inicializar la base de datos con datos de ejemplo? Esta acción solo debe realizarse una vez.')) {
      return;
    }

    setInitializing(true);
    try {
      await initializeDatabase();
      addNotification('success', 'Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Initialization error:', error);
      addNotification('error', 'Error al inicializar la base de datos');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Gestión Contable
          </h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
          {isDemoMode && (
            <div className="mt-3 inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              🎭 Modo DEMO - Sin Firebase
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            icon={LogIn}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Usuario de prueba:</p>
          <p className="font-mono">admin@estudio.com / admin123</p>
        </div>

        {!isDemoMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              icon={Database}
              onClick={handleInitializeDatabase}
              disabled={initializing}
            >
              {initializing ? 'Inicializando...' : 'Inicializar Base de Datos'}
            </Button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Solo para primera configuración
            </p>
          </div>
        )}

        {isDemoMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-600">
              💡 La base de datos se inicializa automáticamente en modo demo.
              <br />
              Solo inicia sesión con las credenciales de arriba.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

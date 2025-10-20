import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import type { Task } from '../types';
import { taskService } from '../services';
import { taskGenerationService } from '../services/taskGenerationService';
import { TaskList } from './tasks/TaskList';
import { TaskForm } from './tasks/TaskForm';
import { Button } from './ui/Button';
import {
  Plus,
  Users,
  FileText,
  Settings,
  LogOut,
  Wand2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, signOut, hasPermission } = useAuth();
  const { addNotification } = useNotification();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatingTasks, setGeneratingTasks] = useState(false);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      addNotification('success', 'Tarea eliminada correctamente');
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      addNotification('error', 'Error al eliminar la tarea');
    }
  };

  const handleGenerateTasks = async () => {
    if (!hasPermission('generateTasks')) {
      addNotification('error', 'No tienes permiso para generar tareas');
      return;
    }

    if (
      !confirm(
        '¿Deseas generar las tareas automáticamente para todos los clientes activos del mes actual?'
      )
    ) {
      return;
    }

    setGeneratingTasks(true);
    try {
      const result = await taskGenerationService.generateTasksForAllClients(
        new Date()
      );
      addNotification(
        'success',
        `Tareas generadas: ${result.success} clientes procesados correctamente`
      );
      if (result.failed > 0) {
        addNotification('warning', `${result.failed} clientes con errores`);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      addNotification('error', 'Error al generar tareas');
    } finally {
      setGeneratingTasks(false);
    }
  };

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestión Contable
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {user?.displayName}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasPermission('generateTasks') && (
                <Button
                  variant="success"
                  icon={Wand2}
                  onClick={handleGenerateTasks}
                  disabled={generatingTasks}
                >
                  {generatingTasks ? 'Generando...' : 'Generar Tareas'}
                </Button>
              )}

              {hasPermission('manageClients') && (
                <Button variant="ghost" icon={Users}>
                  Clientes
                </Button>
              )}

              {hasPermission('manageWorkOrders') && (
                <Button variant="ghost" icon={FileText}>
                  Órdenes
                </Button>
              )}

              {hasPermission('editSettings') && (
                <Button variant="ghost" icon={Settings}>
                  Configuración
                </Button>
              )}

              <Button variant="ghost" icon={LogOut} onClick={signOut}>
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tareas</h2>
          {hasPermission('manageTasks') && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setTaskFormOpen(true)}
            >
              Nueva Tarea
            </Button>
          )}
        </div>

        <TaskList
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={handleCloseForm}
        task={editingTask}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

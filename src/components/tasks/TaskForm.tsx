import React, { useState, useEffect } from 'react';
import type { Task, Client, TaskType, Subtask } from '../../types';
import {
  clientService,
  taskTypeService,
  taskService,
} from '../../services';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { DraggableModal } from '../ui/DraggableModal';
import { Sparkles, Mail, Plus, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSuccess: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess,
}) => {
  const { hasPermission } = useAuth();
  const { addNotification } = useNotification();

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    clientId: '',
    taskTypeId: '',
    status: 'pending',
    priority: false,
    dueDate: new Date(),
    subtasks: [],
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate,
      });
    } else {
      resetForm();
    }
  }, [task]);

  const loadData = async () => {
    try {
      const [clientsData, typesData] = await Promise.all([
        clientService.getAll(),
        taskTypeService.getAll(),
      ]);
      setClients(clientsData);
      setTaskTypes(typesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: '',
      taskTypeId: '',
      status: 'pending',
      priority: false,
      dueDate: new Date(),
      subtasks: [],
    });
  };

  const selectedTaskType = taskTypes.find((t) => t.id === formData.taskTypeId);
  const requiresTimeRange = selectedTaskType?.requiresTimeRange || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate time range for Agenda/Formación tasks
    if (requiresTimeRange && (!formData.startTime || !formData.endTime)) {
      addNotification(
        'error',
        'Las tareas de Agenda y Formación requieren hora de inicio y fin'
      );
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        updatedAt: new Date(),
      };

      if (task?.id) {
        await taskService.update(task.id, taskData);
        addNotification('success', 'Tarea actualizada correctamente');
      } else {
        await taskService.create({
          ...taskData,
          createdAt: new Date(),
        } as Omit<Task, 'id'>);
        addNotification('success', 'Tarea creada correctamente');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      addNotification('error', 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleAIBreakdown = async () => {
    if (!formData.title || !formData.taskTypeId) {
      addNotification('error', 'Completa el título y tipo de tarea primero');
      return;
    }

    setAiLoading(true);
    try {
      const taskTypeName =
        taskTypes.find((t) => t.id === formData.taskTypeId)?.name || '';
      const response = await aiService.generateTaskBreakdown({
        taskTitle: formData.title,
        taskDescription: formData.description,
        taskType: taskTypeName,
      });

      if (response.success) {
        setFormData({
          ...formData,
          subtasks: response.data,
        });
        addNotification('success', 'Subtareas generadas correctamente');
      } else {
        addNotification('error', response.error || 'Error al generar subtareas');
      }
    } catch (error) {
      addNotification('error', 'Error al comunicarse con la IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIEmail = async () => {
    if (!formData.clientId || !formData.title || !formData.dueDate) {
      addNotification('error', 'Completa los datos básicos de la tarea primero');
      return;
    }

    setAiLoading(true);
    try {
      const client = clients.find((c) => c.id === formData.clientId);
      if (!client) return;

      const response = await aiService.generateEmailDraft({
        clientName: client.name,
        taskTitle: formData.title,
        dueDate: formData.dueDate,
        requiredDocuments: formData.requiredDocuments,
      });

      if (response.success) {
        const { subject, body } = response.data;
        // Show email in a simple alert for now
        alert(`Asunto: ${subject}\n\n${body}`);
        addNotification('success', 'Email generado correctamente');
      } else {
        addNotification('error', response.error || 'Error al generar email');
      }
    } catch (error) {
      addNotification('error', 'Error al comunicarse con la IA');
    } finally {
      setAiLoading(false);
    }
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;

    const subtask: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask,
      completed: false,
      order: (formData.subtasks?.length || 0) + 1,
    };

    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), subtask],
    });
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = formData.subtasks?.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setFormData({ ...formData, subtasks: updatedSubtasks });
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = formData.subtasks?.filter(
      (st) => st.id !== subtaskId
    );
    setFormData({ ...formData, subtasks: updatedSubtasks });
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Editar Tarea' : 'Nueva Tarea'}
      width="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Título"
              required
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <Select
            label="Cliente"
            required
            options={[
              { value: '', label: 'Seleccionar cliente' },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={formData.clientId || ''}
            onChange={(e) =>
              setFormData({ ...formData, clientId: e.target.value })
            }
          />

          <Select
            label="Tipo de Tarea"
            required
            options={[
              { value: '', label: 'Seleccionar tipo' },
              ...taskTypes.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={formData.taskTypeId || ''}
            onChange={(e) =>
              setFormData({ ...formData, taskTypeId: e.target.value })
            }
          />

          <Input
            label="Fecha de Vencimiento"
            type="date"
            required
            value={
              formData.dueDate
                ? format(formData.dueDate, 'yyyy-MM-dd')
                : ''
            }
            onChange={(e) =>
              setFormData({ ...formData, dueDate: new Date(e.target.value) })
            }
          />

          <Select
            label="Estado"
            required
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'in_progress', label: 'En Progreso' },
              { value: 'completed', label: 'Completada' },
              { value: 'cancelled', label: 'Cancelada' },
            ]}
            value={formData.status || 'pending'}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
          />

          {requiresTimeRange && (
            <>
              <Input
                label="Hora de Inicio"
                type="time"
                required
                value={formData.startTime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
              <Input
                label="Hora de Fin"
                type="time"
                required
                value={formData.endTime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </>
          )}

          <div className="md:col-span-2">
            <TextArea
              label="Descripción"
              rows={3}
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.priority || false}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Marcar como prioritaria
              </span>
            </label>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Subtareas</h3>
            {hasPermission('useAI') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Sparkles}
                onClick={handleAIBreakdown}
                disabled={aiLoading}
              >
                {aiLoading ? 'Generando...' : 'Generar con IA'}
              </Button>
            )}
          </div>

          <div className="space-y-2 mb-3">
            {formData.subtasks?.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(subtask.id)}
                  className="flex-shrink-0"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      subtask.completed
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {subtask.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </button>
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSubtask(subtask.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Nueva subtarea..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addSubtask}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* AI Email Button */}
        {hasPermission('useAI') && task && (
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              icon={Mail}
              onClick={handleAIEmail}
              disabled={aiLoading}
              className="w-full"
            >
              {aiLoading ? 'Generando...' : 'Generar Email para Cliente'}
            </Button>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Guardando...' : task ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </DraggableModal>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import type { Task, Client, TaskType, TaskFilters } from '../../types';
import { taskService, clientService, taskTypeService } from '../../services';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Star,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  refreshTrigger?: number;
}

type SortField = 'dueDate' | 'title' | 'client' | 'status';
type SortDirection = 'asc' | 'desc';

export const TaskList: React.FC<TaskListProps> = ({
  onEditTask,
  onDeleteTask,
  refreshTrigger,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, clientsData, typesData] = await Promise.all([
        taskService.getAll(),
        clientService.getAll(),
        taskTypeService.getAll(),
      ]);
      setTasks(tasksData);
      setClients(clientsData);
      setTaskTypes(typesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePriority = async (task: Task) => {
    try {
      await taskService.update(task.id, {
        priority: !task.priority,
        updatedAt: new Date(),
      });
      loadData();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply filters
    if (filters.clientId) {
      filtered = filtered.filter((t) => t.clientId === filters.clientId);
    }
    if (filters.taskTypeId) {
      filtered = filtered.filter((t) => t.taskTypeId === filters.taskTypeId);
    }
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    // Sort by priority first, then by selected field
    filtered.sort((a, b) => {
      // Priority tasks always come first
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;

      // Then sort by selected field
      let comparison = 0;
      switch (sortField) {
        case 'dueDate':
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'client':
          const clientA = clients.find((c) => c.id === a.clientId)?.name || '';
          const clientB = clients.find((c) => c.id === b.clientId)?.name || '';
          comparison = clientA.localeCompare(clientB);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, clients, filters, sortField, sortDirection]);

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || '-';
  };

  const getTaskTypeName = (taskTypeId: string) => {
    return taskTypes.find((t) => t.id === taskTypeId)?.name || '-';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando tareas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="font-medium text-gray-700">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar..."
              className="pl-10"
              value={filters.searchText || ''}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
            />
          </div>

          <Select
            options={[
              { value: '', label: 'Todos los clientes' },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={filters.clientId || ''}
            onChange={(e) =>
              setFilters({ ...filters, clientId: e.target.value || undefined })
            }
          />

          <Select
            options={[
              { value: '', label: 'Todos los tipos' },
              ...taskTypes.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={filters.taskTypeId || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                taskTypeId: e.target.value || undefined,
              })
            }
          />

          <Select
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'in_progress', label: 'En Progreso' },
              { value: 'completed', label: 'Completada' },
              { value: 'cancelled', label: 'Cancelada' },
            ]}
            value={filters.status || ''}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as any })
            }
          />
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <Star className="w-4 h-4" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Tarea
                    <SortIcon field="title" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('client')}
                >
                  <div className="flex items-center gap-2">
                    Cliente
                    <SortIcon field="client" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-2">
                    Vencimiento
                    <SortIcon field="dueDate" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Estado
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron tareas
                  </td>
                </tr>
              ) : (
                filteredAndSortedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePriority(task)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            task.priority
                              ? 'fill-yellow-500 text-yellow-500'
                              : ''
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getClientName(task.clientId)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {getTaskTypeName(task.taskTypeId)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(task.dueDate, 'dd/MM/yyyy', { locale: es })}
                      {task.startTime && (
                        <div className="text-xs text-gray-500">
                          {task.startTime} - {task.endTime}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditTask(task)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-right">
        Mostrando {filteredAndSortedTasks.length} de {tasks.length} tareas
      </div>
    </div>
  );
};

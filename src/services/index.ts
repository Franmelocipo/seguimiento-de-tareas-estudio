import { FirestoreService } from './firestoreService';
import { LocalStorageService } from './localStorageService';
import { isDemoMode } from '../lib/firebase/config';
import type {
  Task,
  Client,
  WorkOrder,
  Role,
  TaskType,
  StandardTask,
  DueDate,
} from '../types';

// Service instances - use localStorage in demo mode, Firebase otherwise
export const taskService = isDemoMode
  ? new LocalStorageService<Task>('tasks')
  : new FirestoreService<Task>('tasks');

export const clientService = isDemoMode
  ? new LocalStorageService<Client>('clients')
  : new FirestoreService<Client>('clients');

export const workOrderService = isDemoMode
  ? new LocalStorageService<WorkOrder>('workOrders')
  : new FirestoreService<WorkOrder>('workOrders');

export const roleService = isDemoMode
  ? new LocalStorageService<Role>('roles')
  : new FirestoreService<Role>('roles');

export const taskTypeService = isDemoMode
  ? new LocalStorageService<TaskType>('taskTypes')
  : new FirestoreService<TaskType>('taskTypes');

export const standardTaskService = isDemoMode
  ? new LocalStorageService<StandardTask>('standardTasks')
  : new FirestoreService<StandardTask>('standardTasks');

export const dueDateService = isDemoMode
  ? new LocalStorageService<DueDate>('dueDates')
  : new FirestoreService<DueDate>('dueDates');

export { authService } from './authService';

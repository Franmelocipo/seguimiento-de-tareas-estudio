import { FirestoreService } from './firestoreService';
import type {
  Task,
  Client,
  WorkOrder,
  Role,
  TaskType,
  StandardTask,
  DueDate,
} from '../types';

// Service instances
export const taskService = new FirestoreService<Task>('tasks');
export const clientService = new FirestoreService<Client>('clients');
export const workOrderService = new FirestoreService<WorkOrder>('workOrders');
export const roleService = new FirestoreService<Role>('roles');
export const taskTypeService = new FirestoreService<TaskType>('taskTypes');
export const standardTaskService = new FirestoreService<StandardTask>('standardTasks');
export const dueDateService = new FirestoreService<DueDate>('dueDates');

export { authService } from './authService';

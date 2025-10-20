// Permissions
export type Permission =
  | 'manageClients'
  | 'editSettings'
  | 'generateTasks'
  | 'useAI'
  | 'manageRoles'
  | 'manageTasks'
  | 'manageWorkOrders'
  | 'viewReports';

// Role
export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

// User
export interface User {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Client
export interface Client {
  id: string;
  name: string;
  cuit: string; // 11 dígitos
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  fiscalClosingMonth: number; // 1-12
  assignedStandardTasks: string[]; // IDs de tareas estándar
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task Type
export interface TaskType {
  id: string;
  name: string;
  description?: string;
  requiresTimeRange: boolean; // true for Agenda and Formación
  color?: string;
  icon?: string;
}

// Standard Task
export interface StandardTask {
  id: string;
  name: string;
  taskTypeId: string;
  description?: string;
  estimatedHours?: number;
  requiredDocuments?: string[];
}

// Due Date (Vencimientos)
export interface DueDate {
  id: string;
  taskTypeId: string;
  name: string;
  description?: string;
  // Reglas de cálculo
  dayOfMonth?: number; // Día fijo del mes
  monthOffset?: number; // Meses después del cierre fiscal
  cuitLastDigitRules?: { // Reglas por última cifra del CUIT
    [key: string]: number; // última cifra -> día del mes
  };
  // Para tareas mensuales, trimestrales, etc.
  frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'annual';
}

// Task Status
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  taskTypeId: string;
  standardTaskId?: string;
  workOrderId?: string;
  status: TaskStatus;
  priority: boolean; // Estrella de prioridad
  dueDate: Date;
  startTime?: string; // HH:mm - requerido para Agenda/Formación
  endTime?: string; // HH:mm - requerido para Agenda/Formación
  assignedTo?: string; // userId
  subtasks?: Subtask[];
  requiredDocuments?: string[];
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Subtask
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// Work Order
export interface WorkOrder {
  id: string;
  code: string; // Código único
  title: string;
  description?: string;
  clientId: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  taskIds: string[]; // Tareas asociadas
  totalHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Filter options
export interface TaskFilters {
  clientId?: string;
  taskTypeId?: string;
  status?: TaskStatus;
  priority?: boolean;
  searchText?: string;
  assignedTo?: string;
}

// AI Request types
export interface AITaskBreakdownRequest {
  taskTitle: string;
  taskDescription?: string;
  taskType: string;
}

export interface AIEmailRequest {
  clientName: string;
  taskTitle: string;
  dueDate: Date;
  requiredDocuments?: string[];
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

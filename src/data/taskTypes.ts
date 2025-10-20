import type { TaskType } from '../types';

export const defaultTaskTypes: Omit<TaskType, 'id'>[] = [
  {
    name: 'Impuestos',
    description: 'Declaraciones y presentaciones impositivas',
    requiresTimeRange: false,
    color: '#ef4444',
    icon: 'FileText',
  },
  {
    name: 'Laboral',
    description: 'Liquidación de sueldos y obligaciones laborales',
    requiresTimeRange: false,
    color: '#3b82f6',
    icon: 'Users',
  },
  {
    name: 'Estados Contables',
    description: 'Preparación y presentación de estados contables',
    requiresTimeRange: false,
    color: '#8b5cf6',
    icon: 'BarChart',
  },
  {
    name: 'Agenda',
    description: 'Reuniones, llamadas y eventos programados',
    requiresTimeRange: true,
    color: '#10b981',
    icon: 'Calendar',
  },
  {
    name: 'Formación y Capacitación',
    description: 'Cursos, talleres y capacitaciones',
    requiresTimeRange: true,
    color: '#f59e0b',
    icon: 'GraduationCap',
  },
  {
    name: 'Asesoramiento',
    description: 'Consultoría y asesoramiento contable',
    requiresTimeRange: false,
    color: '#06b6d4',
    icon: 'MessageSquare',
  },
  {
    name: 'Auditoría',
    description: 'Trabajos de auditoría',
    requiresTimeRange: false,
    color: '#ec4899',
    icon: 'Shield',
  },
  {
    name: 'Otros',
    description: 'Otras tareas administrativas',
    requiresTimeRange: false,
    color: '#6b7280',
    icon: 'Folder',
  },
];

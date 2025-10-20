import type { Role } from '../types';

export const defaultRoles: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Administrador',
    permissions: [
      'manageClients',
      'editSettings',
      'generateTasks',
      'useAI',
      'manageRoles',
      'manageTasks',
      'manageWorkOrders',
      'viewReports',
    ],
  },
  {
    name: 'Contador Senior',
    permissions: [
      'manageClients',
      'generateTasks',
      'useAI',
      'manageTasks',
      'manageWorkOrders',
      'viewReports',
    ],
  },
  {
    name: 'Contador Junior',
    permissions: ['manageTasks', 'viewReports'],
  },
  {
    name: 'Asistente',
    permissions: ['manageTasks'],
  },
];

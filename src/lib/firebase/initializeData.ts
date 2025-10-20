import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { authService } from '../../services/authService';
import {
  roleService,
  taskTypeService,
  standardTaskService,
  dueDateService,
} from '../../services';
import { defaultRoles } from '../../data/roles';
import { defaultTaskTypes } from '../../data/taskTypes';
import { defaultStandardTasks } from '../../data/standardTasks';
import { defaultDueDates } from '../../data/dueDates';

/**
 * Initialize the database with default data
 * This should be run once when setting up a new instance
 */
export async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Check if already initialized
    const initDoc = await getDoc(doc(db, 'system', 'initialized'));
    if (initDoc.exists()) {
      console.log('Database already initialized');
      return;
    }

    // Create roles
    console.log('Creating roles...');
    const roleIds: { [key: string]: string } = {};
    for (const role of defaultRoles) {
      const createdRole = await roleService.create({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      roleIds[role.name] = createdRole.id;
    }

    // Create admin user
    console.log('Creating admin user...');
    try {
      await authService.createUser(
        'admin@estudio.com',
        'admin123',
        'Administrador',
        roleIds['Administrador']
      );
    } catch (error: any) {
      // If user already exists, that's fine
      if (error.code !== 'auth/email-already-in-use') {
        throw error;
      }
    }

    // Create task types
    console.log('Creating task types...');
    const taskTypeIds: { [key: string]: string } = {};
    for (const taskType of defaultTaskTypes) {
      const createdType = await taskTypeService.create(taskType);
      taskTypeIds[taskType.name] = createdType.id;
    }

    // Create standard tasks (update taskTypeId references)
    console.log('Creating standard tasks...');
    for (const standardTask of defaultStandardTasks) {
      // Map the placeholder taskTypeId to the actual ID
      let taskTypeId = standardTask.taskTypeId;

      // Map placeholder IDs to actual task type names
      const taskTypeMap: { [key: string]: string } = {
        'impuestos': 'Impuestos',
        'laboral': 'Laboral',
        'estados_contables': 'Estados Contables',
        'asesoramiento': 'Asesoramiento',
      };

      const taskTypeName = taskTypeMap[taskTypeId];
      if (taskTypeName && taskTypeIds[taskTypeName]) {
        taskTypeId = taskTypeIds[taskTypeName];
      }

      await standardTaskService.create({
        ...standardTask,
        taskTypeId,
      });
    }

    // Create due dates (update taskTypeId references)
    console.log('Creating due dates...');
    for (const dueDate of defaultDueDates) {
      let taskTypeId = dueDate.taskTypeId;

      // Map placeholder to actual ID
      if (taskTypeId === 'impuestos' && taskTypeIds['Impuestos']) {
        taskTypeId = taskTypeIds['Impuestos'];
      } else if (taskTypeId === 'laboral' && taskTypeIds['Laboral']) {
        taskTypeId = taskTypeIds['Laboral'];
      } else if (taskTypeId === 'estados_contables' && taskTypeIds['Estados Contables']) {
        taskTypeId = taskTypeIds['Estados Contables'];
      }

      await dueDateService.create({
        ...dueDate,
        taskTypeId,
      });
    }

    // Mark as initialized
    await setDoc(doc(db, 'system', 'initialized'), {
      initialized: true,
      timestamp: new Date().toISOString(),
    });

    console.log('Database initialization complete!');
    alert('Base de datos inicializada correctamente.\n\nUsuario admin creado:\nEmail: admin@estudio.com\nContraseña: admin123');
  } catch (error) {
    console.error('Error initializing database:', error);
    alert('Error al inicializar la base de datos. Ver consola para detalles.');
    throw error;
  }
}

/**
 * Reset the initialization flag (use with caution!)
 */
export async function resetInitialization() {
  await setDoc(doc(db, 'system', 'initialized'), {
    initialized: false,
    timestamp: new Date().toISOString(),
  });
  console.log('Initialization reset');
}

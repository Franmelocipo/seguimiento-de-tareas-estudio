import { isDemoMode } from './config';
import { authService } from '../../services/authService';
import {
  roleService,
  taskTypeService,
  standardTaskService,
  dueDateService,
  clientService,
  taskService,
} from '../../services';
import { defaultRoles } from '../../data/roles';
import { defaultTaskTypes } from '../../data/taskTypes';
import { defaultStandardTasks } from '../../data/standardTasks';
import { defaultDueDates } from '../../data/dueDates';

const INIT_FLAG = isDemoMode ? 'demo_initialized' : 'firebase_initialized';

/**
 * Check if database is already initialized
 */
export async function isInitialized(): Promise<boolean> {
  if (isDemoMode) {
    return localStorage.getItem(INIT_FLAG) === 'true';
  }

  // For Firebase, check the system collection
  const { doc, getDoc } = await import('firebase/firestore');
  const { db } = await import('./config');
  const initDoc = await getDoc(doc(db!, 'system', 'initialized'));
  return initDoc.exists();
}

/**
 * Initialize the database with default data
 */
export async function initializeDatabase() {
  console.log(`🚀 Inicializando base de datos (${isDemoMode ? 'DEMO' : 'Firebase'})...`);

  try {
    // Check if already initialized
    if (await isInitialized()) {
      console.log('✅ Base de datos ya inicializada');
      return;
    }

    // Create roles
    console.log('📝 Creando roles...');
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
    console.log('👤 Creando usuario admin...');
    try {
      await authService.createUser(
        'admin@estudio.com',
        'admin123',
        'Administrador',
        roleIds['Administrador']
      );
    } catch (error: any) {
      if (error.code !== 'auth/email-already-in-use' && !error.message?.includes('incorrectos')) {
        throw error;
      }
    }

    // Create task types
    console.log('📋 Creando tipos de tarea...');
    const taskTypeIds: { [key: string]: string } = {};
    for (const taskType of defaultTaskTypes) {
      const createdType = await taskTypeService.create(taskType);
      taskTypeIds[taskType.name] = createdType.id;
    }

    // Create standard tasks
    console.log('⚙️  Creando tareas estándar...');
    for (const standardTask of defaultStandardTasks) {
      let taskTypeId = standardTask.taskTypeId;

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

    // Create due dates
    console.log('📅 Creando vencimientos...');
    for (const dueDate of defaultDueDates) {
      let taskTypeId = dueDate.taskTypeId;

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

    // Create demo clients
    console.log('👥 Creando clientes de ejemplo...');
    const demoClients = [
      {
        name: 'Comercial San Martín SA',
        cuit: '30-71234567-8',
        businessName: 'Comercial San Martín Sociedad Anónima',
        email: 'info@comercialsanmartin.com',
        phone: '011-4567-8900',
        fiscalClosingMonth: 12,
        assignedStandardTasks: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Tech Solutions SRL',
        cuit: '30-71234568-9',
        businessName: 'Tech Solutions Sociedad de Responsabilidad Limitada',
        email: 'contacto@techsolutions.com',
        phone: '011-5678-9012',
        fiscalClosingMonth: 12,
        assignedStandardTasks: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Consultora Río de la Plata',
        cuit: '30-71234569-0',
        businessName: 'Consultora Río de la Plata SRL',
        email: 'info@rioplata.com',
        phone: '011-6789-0123',
        fiscalClosingMonth: 6,
        assignedStandardTasks: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const client of demoClients) {
      await clientService.create(client);
    }

    // Create demo tasks
    console.log('✅ Creando tareas de ejemplo...');
    const clients = await clientService.getAll();
    const taskTypes = await taskTypeService.getAll();
    const impuestosType = taskTypes.find(t => t.name === 'Impuestos');
    const laboralType = taskTypes.find(t => t.name === 'Laboral');

    if (clients.length > 0 && impuestosType) {
      const demoTasks = [
        {
          title: `IVA Mensual - ${clients[0].name}`,
          description: 'Declaración jurada mensual de IVA',
          clientId: clients[0].id,
          taskTypeId: impuestosType.id,
          status: 'pending' as const,
          priority: true,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          requiredDocuments: ['Facturas de compra', 'Facturas de venta'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: `SUSS - ${clients[0].name}`,
          description: 'Sistema Único de Seguridad Social',
          clientId: clients[0].id,
          taskTypeId: laboralType?.id || impuestosType.id,
          status: 'in_progress' as const,
          priority: false,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const task of demoTasks) {
        await taskService.create(task);
      }
    }

    // Mark as initialized
    if (isDemoMode) {
      localStorage.setItem(INIT_FLAG, 'true');
    } else {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./config');
      await setDoc(doc(db!, 'system', 'initialized'), {
        initialized: true,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('🎉 Base de datos inicializada correctamente!');

    if (isDemoMode) {
      alert('✅ Base de datos inicializada en modo DEMO\n\nUsuario admin creado:\n📧 Email: admin@estudio.com\n🔑 Contraseña: admin123\n\nSe crearon 3 clientes y 2 tareas de ejemplo.');
    } else {
      alert('✅ Base de datos inicializada correctamente\n\nUsuario admin creado:\n📧 Email: admin@estudio.com\n🔑 Contraseña: admin123');
    }
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    alert('Error al inicializar la base de datos. Ver consola para detalles.');
    throw error;
  }
}

/**
 * Auto-initialize in demo mode if not already initialized
 */
export async function autoInitializeIfNeeded() {
  if (isDemoMode && !(await isInitialized())) {
    console.log('🎭 Modo DEMO detectado - Inicializando automáticamente...');
    await initializeDatabase();
  }
}

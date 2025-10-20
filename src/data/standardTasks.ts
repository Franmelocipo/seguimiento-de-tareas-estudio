import type { StandardTask } from '../types';

export const defaultStandardTasks: Omit<StandardTask, 'id'>[] = [
  // Impuestos
  {
    name: 'IVA Mensual',
    taskTypeId: 'impuestos', // Este ID será reemplazado por el ID real en la inicialización
    description: 'Declaración jurada de IVA',
    estimatedHours: 2,
    requiredDocuments: [
      'Facturas de compra',
      'Facturas de venta',
      'Notas de crédito/débito',
      'Comprobantes de retenciones',
    ],
  },
  {
    name: 'Ganancias Mensual',
    taskTypeId: 'impuestos',
    description: 'Declaración jurada de Impuesto a las Ganancias',
    estimatedHours: 3,
    requiredDocuments: [
      'Comprobantes de ingresos',
      'Facturas de gastos deducibles',
      'Retenciones sufridas',
    ],
  },
  {
    name: 'SUSS',
    taskTypeId: 'impuestos',
    description: 'Sistema Único de Seguridad Social',
    estimatedHours: 2,
    requiredDocuments: ['Liquidación de sueldos', 'Altas y bajas de empleados'],
  },
  {
    name: 'Ingresos Brutos',
    taskTypeId: 'impuestos',
    description: 'Declaración de Ingresos Brutos provincial',
    estimatedHours: 2,
    requiredDocuments: ['Facturas emitidas', 'Comprobantes de percepciones'],
  },
  {
    name: 'Bienes Personales',
    taskTypeId: 'impuestos',
    description: 'Declaración anual de Bienes Personales',
    estimatedHours: 4,
    requiredDocuments: [
      'Valuación de inmuebles',
      'Tenencias bancarias',
      'Vehículos',
      'Inversiones',
    ],
  },
  {
    name: 'Ganancias Anual',
    taskTypeId: 'impuestos',
    description: 'Declaración jurada anual de Impuesto a las Ganancias',
    estimatedHours: 8,
    requiredDocuments: [
      'Balance',
      'Cuadros anexos',
      'Comprobantes de deducciones',
    ],
  },

  // Laboral
  {
    name: 'Liquidación de Sueldos',
    taskTypeId: 'laboral',
    description: 'Liquidación mensual de haberes',
    estimatedHours: 4,
    requiredDocuments: [
      'Novedades del personal',
      'Horas extras',
      'Presentismo',
      'Ausencias',
    ],
  },
  {
    name: 'F.931 - AFIP',
    taskTypeId: 'laboral',
    description: 'Declaración jurada de contribuciones patronales',
    estimatedHours: 2,
    requiredDocuments: ['Liquidación de sueldos', 'Altas y bajas'],
  },
  {
    name: 'Obra Social',
    taskTypeId: 'laboral',
    description: 'Liquidación y pago de aportes de obra social',
    estimatedHours: 1,
    requiredDocuments: ['Liquidación de sueldos'],
  },

  // Estados Contables
  {
    name: 'Estados Contables Anuales',
    taskTypeId: 'estados_contables',
    description: 'Preparación de Estados Contables anuales',
    estimatedHours: 20,
    requiredDocuments: [
      'Libro Mayor',
      'Balance de Sumas y Saldos',
      'Conciliaciones bancarias',
      'Inventario de mercaderías',
      'Valuación de bienes de uso',
      'Detalle de deudas',
    ],
  },
  {
    name: 'Balance Mensual',
    taskTypeId: 'estados_contables',
    description: 'Balance de gestión mensual',
    estimatedHours: 4,
    requiredDocuments: [
      'Registros contables',
      'Conciliaciones bancarias',
      'Cuadro de resultados',
    ],
  },
  {
    name: 'Balance Trimestral',
    taskTypeId: 'estados_contables',
    description: 'Balance de gestión trimestral',
    estimatedHours: 6,
    requiredDocuments: [
      'Registros contables',
      'Análisis de cuentas',
      'Ratios financieros',
    ],
  },

  // Asesoramiento
  {
    name: 'Planificación Fiscal',
    taskTypeId: 'asesoramiento',
    description: 'Análisis y planificación tributaria',
    estimatedHours: 6,
    requiredDocuments: ['Proyección de ingresos y gastos', 'Estados contables'],
  },
  {
    name: 'Análisis de Rentabilidad',
    taskTypeId: 'asesoramiento',
    description: 'Estudio de rentabilidad y costos',
    estimatedHours: 8,
    requiredDocuments: [
      'Estados contables',
      'Detalle de costos',
      'Presupuestos',
    ],
  },
];

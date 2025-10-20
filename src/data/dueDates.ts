import type { DueDate } from '../types';

export const defaultDueDates: Omit<DueDate, 'id'>[] = [
  // IVA Mensual - Vencimientos según terminación CUIT
  {
    taskTypeId: 'impuestos',
    name: 'IVA Mensual',
    description: 'Vencimiento de declaración jurada de IVA según terminación CUIT',
    frequency: 'monthly',
    cuitLastDigitRules: {
      '0': 13,
      '1': 13,
      '2': 14,
      '3': 14,
      '4': 15,
      '5': 15,
      '6': 16,
      '7': 16,
      '8': 17,
      '9': 17,
    },
  },

  // Ganancias Mensual - Vencimientos según terminación CUIT
  {
    taskTypeId: 'impuestos',
    name: 'Ganancias Mensual',
    description:
      'Vencimiento de declaración jurada de Ganancias según terminación CUIT',
    frequency: 'monthly',
    cuitLastDigitRules: {
      '0': 13,
      '1': 13,
      '2': 14,
      '3': 14,
      '4': 15,
      '5': 15,
      '6': 16,
      '7': 16,
      '8': 17,
      '9': 17,
    },
  },

  // SUSS - Seguridad Social
  {
    taskTypeId: 'laboral',
    name: 'SUSS',
    description: 'Vencimiento del Sistema Único de Seguridad Social',
    frequency: 'monthly',
    cuitLastDigitRules: {
      '0': 7,
      '1': 7,
      '2': 8,
      '3': 8,
      '4': 9,
      '5': 9,
      '6': 10,
      '7': 10,
      '8': 11,
      '9': 11,
    },
  },

  // F.931 - AFIP
  {
    taskTypeId: 'laboral',
    name: 'F.931',
    description: 'Declaración jurada de aportes y contribuciones',
    frequency: 'monthly',
    cuitLastDigitRules: {
      '0': 10,
      '1': 10,
      '2': 11,
      '3': 11,
      '4': 12,
      '5': 12,
      '6': 13,
      '7': 13,
      '8': 14,
      '9': 14,
    },
  },

  // Ingresos Brutos - puede variar según provincia
  {
    taskTypeId: 'impuestos',
    name: 'Ingresos Brutos',
    description: 'Vencimiento de Ingresos Brutos (puede variar según jurisdicción)',
    frequency: 'monthly',
    dayOfMonth: 12, // Fecha genérica, puede ajustarse
  },

  // Estados Contables Anuales - 5 meses después del cierre
  {
    taskTypeId: 'estados_contables',
    name: 'Estados Contables Anuales',
    description: 'Presentación de Estados Contables (5 meses después del cierre fiscal)',
    frequency: 'annual',
    monthOffset: 5, // 5 meses después del mes de cierre fiscal
    dayOfMonth: 15,
  },

  // Ganancias Anual - 5 meses después del cierre
  {
    taskTypeId: 'impuestos',
    name: 'Ganancias Anual',
    description:
      'Declaración jurada anual de Ganancias (5 meses después del cierre)',
    frequency: 'annual',
    monthOffset: 5,
    cuitLastDigitRules: {
      '0': 13,
      '1': 13,
      '2': 14,
      '3': 14,
      '4': 15,
      '5': 15,
      '6': 16,
      '7': 16,
      '8': 17,
      '9': 17,
    },
  },

  // Bienes Personales - Junio de cada año
  {
    taskTypeId: 'impuestos',
    name: 'Bienes Personales',
    description: 'Declaración jurada anual de Bienes Personales',
    frequency: 'annual',
    cuitLastDigitRules: {
      '0': 13,
      '1': 13,
      '2': 14,
      '3': 14,
      '4': 15,
      '5': 15,
      '6': 16,
      '7': 16,
      '8': 17,
      '9': 17,
    },
  },
];

# Sistema de Gestión Contable - Estudio Contable Argentina

Aplicación web completa para el seguimiento de tareas y obligaciones de un estudio contable en Argentina, con generación automática de tareas basada en vencimientos AFIP, sistema de permisos granular y asistencia de IA.

## Características Principales

### 🔐 Sistema de Autenticación y Permisos
- Login seguro con email y contraseña
- Gestión de roles personalizables
- Permisos granulares: `manageClients`, `editSettings`, `generateTasks`, `useAI`, etc.
- Usuario admin por defecto incluido

### 📋 Gestión Integral de Tareas
- CRUD completo de tareas
- Sistema de **prioridades** con estrella (tareas prioritarias aparecen primero)
- **Validación especial** para tareas de Agenda y Formación (requieren hora de inicio/fin)
- Subtareas con checklist
- Filtros avanzados (cliente, tipo, estado, búsqueda de texto)
- Tabla ordenable por cualquier columna

### 🤖 Generación Automática de Tareas
- Genera tareas basadas en vencimientos AFIP
- Considera **terminación del CUIT** para calcular fechas exactas
- Respeta el **mes de cierre fiscal** del cliente
- Compatible con obligaciones mensuales, trimestrales y anuales
- Incluye vencimientos precargados: IVA, Ganancias, SUSS, F.931, Ingresos Brutos, etc.

### 🤖 Asistencia con IA
- **Desglose de tareas**: genera automáticamente subtareas inteligentes
- **Redacción de emails**: crea borradores profesionales para recordar vencimientos a clientes
- Requiere permiso `useAI` en el rol del usuario

### 👥 Gestión de Clientes
- CRUD completo de clientes
- Información de CUIT, razón social, mes de cierre fiscal
- Asignación de tareas estándar por cliente
- Solo usuarios con permiso `manageClients`

### 📄 Órdenes de Trabajo
- Gestión de órdenes de trabajo vinculadas a tareas
- Seguimiento de estado y horas
- Asociación con múltiples tareas

### 🎨 Interfaz de Usuario
- Modales **arrastrables** para mejor organización del espacio de trabajo
- Sistema de **notificaciones** visuales
- Diseño responsive con Tailwind CSS
- Iconos con Lucide React

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Base de Datos**: Google Cloud Firestore
- **IA**: Anthropic Claude API (configurable)
- **Formularios**: React Hook Form + Zod
- **Fechas**: date-fns (con locale español)
- **Íconos**: Lucide React
- **UI Draggable**: react-draggable

## Configuración Inicial

### 1. Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Firebase/Google Cloud

### 2. Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd seguimiento-de-tareas-estudio

# Instalar dependencias
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita **Authentication** con el proveedor de Email/Password
3. Crea una base de datos **Firestore** en modo producción
4. Copia las credenciales de tu proyecto

### 4. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Optional: AI API Configuration
VITE_AI_API_KEY=tu_api_key_de_anthropic
VITE_AI_API_ENDPOINT=https://api.anthropic.com/v1/messages
```

**Nota**: Para obtener las credenciales de Firebase:
1. Ve a Project Settings > General
2. En "Your apps", selecciona Web app
3. Copia los valores de `firebaseConfig`

### 5. Configurar Reglas de Firestore

En Firebase Console > Firestore Database > Rules, configura:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Inicializar la Base de Datos

1. Ejecuta la aplicación:
```bash
npm run dev
```

2. Abre http://localhost:5173 en tu navegador
3. Haz clic en el botón **"Inicializar Base de Datos"**
4. Esto creará:
   - Roles predefinidos (Administrador, Contador Senior, Contador Junior, Asistente)
   - Usuario admin (email: `admin@estudio.com`, password: `admin123`)
   - Tipos de tarea (Impuestos, Laboral, Estados Contables, Agenda, etc.)
   - Tareas estándar (IVA, Ganancias, SUSS, etc.)
   - Vencimientos AFIP configurados

### 7. Iniciar Sesión

Usa las credenciales del usuario admin:
- **Email**: admin@estudio.com
- **Password**: admin123

## Uso de la Aplicación

### Crear un Cliente

1. Ve a la sección "Clientes" (requiere permiso `manageClients`)
2. Haz clic en "Nuevo Cliente"
3. Completa los datos:
   - Nombre
   - CUIT (11 dígitos)
   - Razón Social
   - Mes de cierre fiscal (1-12)
   - Asigna las tareas estándar que aplican a este cliente

### Generar Tareas Automáticamente

1. Haz clic en el botón **"Generar Tareas"** en el dashboard (requiere permiso `generateTasks`)
2. El sistema creará automáticamente todas las tareas del mes actual para cada cliente activo
3. Las fechas de vencimiento se calcularán según:
   - Última cifra del CUIT del cliente
   - Mes de cierre fiscal (para obligaciones anuales)
   - Reglas de vencimiento AFIP precargadas

### Gestionar Tareas

#### Filtrar Tareas
- Usa los filtros en la parte superior de la tabla
- Búsqueda de texto libre
- Filtro por cliente, tipo de tarea y estado
- Los filtros se pueden combinar

#### Ordenar Tareas
- Haz clic en cualquier encabezado de columna para ordenar
- Las **tareas prioritarias** siempre aparecen primero
- El segundo nivel de ordenamiento es el campo seleccionado

#### Marcar como Prioritaria
- Haz clic en la estrella para marcar/desmarcar prioridad
- Las tareas prioritarias se destacan y aparecen al inicio de la lista

#### Editar Tarea
1. Haz clic en el ícono de edición
2. El modal es **arrastrable** - puedes moverlo por la pantalla
3. Modifica los campos necesarios
4. Si la tarea es de tipo "Agenda" o "Formación", debes especificar hora de inicio y fin

#### Usar IA (requiere permiso `useAI`)

**Generar Subtareas:**
1. En el formulario de tarea, completa el título y tipo
2. Haz clic en "Generar con IA"
3. La IA creará automáticamente una lista de subtareas específicas

**Redactar Email:**
1. Abre una tarea existente
2. Haz clic en "Generar Email para Cliente"
3. La IA creará un borrador profesional con:
   - Asunto apropiado
   - Recordatorio del vencimiento
   - Lista de documentación requerida
   - Tono profesional y cordial

### Gestionar Roles y Permisos

1. Ve a "Configuración" (requiere permiso `editSettings`)
2. Crea nuevos roles o edita los existentes
3. Asigna permisos específicos a cada rol:
   - `manageClients`: Gestionar clientes
   - `manageTasks`: Crear/editar/eliminar tareas
   - `manageWorkOrders`: Gestionar órdenes de trabajo
   - `generateTasks`: Generar tareas automáticamente
   - `useAI`: Usar funciones de IA
   - `editSettings`: Modificar configuración
   - `manageRoles`: Gestionar roles
   - `viewReports`: Ver reportes

## Estructura del Proyecto

```
src/
├── components/
│   ├── auth/              # Componentes de autenticación
│   ├── clients/           # Gestión de clientes
│   ├── tasks/             # Gestión de tareas
│   ├── workOrders/        # Órdenes de trabajo
│   ├── settings/          # Configuración
│   └── ui/                # Componentes reutilizables
├── contexts/              # Contextos de React (Auth, Notifications)
├── data/                  # Datos maestros precargados
├── lib/
│   └── firebase/          # Configuración de Firebase
├── services/              # Servicios de Firebase y lógica de negocio
├── types/                 # Definiciones de TypeScript
└── App.tsx                # Componente principal
```

## Datos Precargados

### Tipos de Tarea
- Impuestos
- Laboral
- Estados Contables
- Agenda (requiere horario)
- Formación y Capacitación (requiere horario)
- Asesoramiento
- Auditoría
- Otros

### Tareas Estándar Incluidas
- IVA Mensual
- Ganancias Mensual
- SUSS
- F.931
- Ingresos Brutos
- Liquidación de Sueldos
- Estados Contables Anuales
- Y más...

### Vencimientos AFIP
Todos los vencimientos principales de Argentina están precargados con las reglas correctas según terminación de CUIT.

## Personalización

### Agregar Nuevos Tipos de Tarea

Edita `src/data/taskTypes.ts`:

```typescript
{
  name: 'Mi Nuevo Tipo',
  description: 'Descripción',
  requiresTimeRange: false, // true si requiere horario
  color: '#hexcolor',
  icon: 'NombreIconoLucide',
}
```

### Agregar Nuevas Tareas Estándar

Edita `src/data/standardTasks.ts`:

```typescript
{
  name: 'Nueva Tarea',
  taskTypeId: 'impuestos', // será reemplazado por el ID real
  description: 'Descripción de la tarea',
  estimatedHours: 2,
  requiredDocuments: ['Doc 1', 'Doc 2'],
}
```

### Agregar Nuevos Vencimientos

Edita `src/data/dueDates.ts`:

```typescript
{
  taskTypeId: 'impuestos',
  name: 'Nuevo Vencimiento',
  description: 'Descripción',
  frequency: 'monthly', // 'monthly' | 'bimonthly' | 'quarterly' | 'annual'
  cuitLastDigitRules: {
    '0': 13,
    '1': 13,
    // ... reglas por última cifra CUIT
  },
  // O usar día fijo:
  dayOfMonth: 15,
}
```

## Deployment

### Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`

### Hosting Sugerido

**Firebase Hosting** (recomendado por integración):

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Otras opciones**:
- Vercel
- Netlify
- Google Cloud Run
- AWS S3 + CloudFront

### Configuración de Producción

Asegúrate de:
1. Configurar variables de entorno en tu plataforma de hosting
2. Actualizar las reglas de Firestore para producción
3. Habilitar HTTPS
4. Configurar dominios personalizados

## Seguridad

### Mejores Prácticas Implementadas

- ✅ Autenticación requerida para todas las operaciones
- ✅ Permisos granulares por rol
- ✅ Validación en frontend y backend
- ✅ Reglas de Firestore configurables
- ✅ Variables de entorno para credenciales

### Recomendaciones Adicionales

1. **Firestore Rules**: Ajusta las reglas de seguridad según tu caso de uso
2. **Backup**: Configura backups automáticos en Firebase
3. **Monitoring**: Usa Firebase Analytics para monitorear uso
4. **Rate Limiting**: Configura límites en Firebase para prevenir abuso
5. **Actualiza Contraseñas**: Cambia la contraseña del admin inmediatamente

## Soporte y Contribución

Para reportar bugs o solicitar features, abre un issue en el repositorio.

## Licencia

MIT

---

**Desarrollado para estudios contables en Argentina** 🇦🇷

Para más información sobre vencimientos AFIP y obligaciones fiscales, visita [AFIP](https://www.afip.gob.ar/)

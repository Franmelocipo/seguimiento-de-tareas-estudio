# 🚀 Guía de Deployment en Vercel

## Opción 1: Deployment Automático (RECOMENDADO) - 2 minutos

### Paso 1: Ir a Vercel
Abre en tu navegador: **https://vercel.com/new**

### Paso 2: Autenticación
- Haz clic en **"Continue with GitHub"**
- Autoriza a Vercel a acceder a tus repositorios

### Paso 3: Importar Repositorio
1. Busca el repositorio: **`seguimiento-de-tareas-estudio`**
2. Haz clic en **"Import"** junto al repositorio

### Paso 4: Configurar Proyecto

En la página de configuración, **NO cambies nada**, solo verifica:

```
Project Name: seguimiento-de-tareas-estudio
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Variables de Entorno:** DÉJALAS VACÍAS (el modo demo no necesita Firebase)

### Paso 5: Deploy
1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos mientras Vercel compila y despliega
3. Verás un mensaje de "Congratulations! 🎉"

### Paso 6: Obtener URL
Tu app estará disponible en:
```
https://seguimiento-de-tareas-estudio.vercel.app
```

O una URL similar que Vercel te asigne.

---

## Opción 2: Deployment desde CLI (Alternativo)

Si prefieres usar la terminal:

### Paso 1: Instalar Vercel CLI Global
```bash
npm install -g vercel
```

### Paso 2: Login
```bash
vercel login
```
Sigue las instrucciones en el navegador para autenticarte.

### Paso 3: Deploy
```bash
vercel --prod
```

Responde a las preguntas:
- Set up and deploy? **Y**
- Which scope? **[Tu cuenta]**
- Link to existing project? **N**
- What's your project's name? **seguimiento-de-tareas-estudio**
- In which directory is your code located? **./**
- Want to override the settings? **N**

---

## 🎯 Después del Deployment

### ✅ Verificar que funciona:
1. Abre la URL que Vercel te dio
2. Deberías ver la pantalla de login con el badge "🎭 Modo DEMO"
3. Inicia sesión con: `admin@estudio.com` / `admin123`
4. Deberías ver las 2 tareas de ejemplo

### 🔄 Actualizaciones Automáticas:
Cada vez que hagas `git push` a la rama, Vercel:
- Detecta el cambio automáticamente
- Compila la nueva versión
- La despliega automáticamente
- Te notifica por email

### 🌍 Compartir:
Puedes compartir la URL con quien quieras. Cada persona tendrá sus propios datos en localStorage.

---

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica que el build funcione localmente: `npm run build`
- Revisa los logs en Vercel para ver el error específico

### Error: "Page not found" (404)
- Verifica que `vercel.json` esté en el repositorio
- Este archivo ya está incluido y configurado correctamente

### La app se ve en blanco
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Puede ser que el modo demo no se activó correctamente

### Quiero usar Firebase en Vercel
1. Ve a Project Settings en Vercel
2. Environment Variables
3. Agrega las variables del `.env.example` con tus credenciales reales
4. Redeploy

---

## 📊 Configuración ya incluida

✅ `vercel.json` - Configuración de rutas (SPA)
✅ Build optimizado para producción
✅ Modo demo activo por defecto
✅ Auto-inicialización de datos
✅ Sistema de backup funcional

---

## 🎉 ¡Listo!

Una vez desplegado, tendrás:
- URL pública para acceder desde cualquier lugar
- Actualizaciones automáticas en cada push
- Modo demo funcionando perfectamente
- Sistema de backup para mantener datos

**Siguiente paso:** Abre la URL y exporta tu primer backup desde Configuración.

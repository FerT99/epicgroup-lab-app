# 🔧 Sistema de Administrador - Análisis de Funcionalidades

## 📊 Estado Actual vs Requerimientos

### ✅ YA IMPLEMENTADO

1. **Panel Básico de Admin** (`AdminPanel.tsx`)
   - Inserción masiva de usuarios
   - Selección por cohorte (IPDC1, IPDC3, IPDC5)
   - Manejo de errores y reintentos

2. **Base de Datos**
   - Tabla `users` con campos básicos
   - Sistema de autenticación con Supabase
   - Triggers de sincronización

### ❌ FALTA IMPLEMENTAR

## 1. Estructura Jerárquica de Configuración

### Centro Educativo → Grado → Sección → Materia

**Tablas Creadas** (en `admin-system-schema.sql`):
- ✅ `educational_centers` - Centros educativos
- ✅ `grades_levels` - Grados académicos
- ✅ `sections` - Secciones por grado
- ✅ `subjects` - Materias/asignaturas
- ✅ `professor_subjects` - Asignación profesor-materia

**Funcionalidades Necesarias**:

#### a) Vista de Configuración Jerárquica
- [ ] Interfaz para gestionar centros educativos
  - Listar centros existentes
  - Agregar nuevo centro
  - Editar centro
  - Activar/desactivar centro
  
- [ ] Interfaz para gestionar grados
  - Ver grados por centro
  - Agregar grado a un centro
  - Editar grado
  - Activar/desactivar grado

- [ ] Interfaz para gestionar secciones
  - Ver secciones por grado
  - Agregar sección a un grado
  - Editar sección (nombre, capacidad)
  - Activar/desactivar sección

- [ ] Interfaz para gestionar materias
  - Ver materias por sección
  - Agregar materia a una sección
  - Editar materia (nombre, horas semanales)
  - Activar/desactivar materia

#### b) Componentes UI Necesarios
- [ ] `HierarchyConfigScreen.tsx` - Vista principal de configuración
- [ ] `CenterManagement.tsx` - Gestión de centros
- [ ] `GradeManagement.tsx` - Gestión de grados
- [ ] `SectionManagement.tsx` - Gestión de secciones
- [ ] `SubjectManagement.tsx` - Gestión de materias
- [ ] Componente de árbol jerárquico visual

## 2. Gestión de Usuarios

### Dar de Alta Alumnos y Profesores

**Funcionalidades Necesarias**:

#### a) Alta de Usuarios
- [ ] Formulario para crear alumno
  - Datos personales (nombre, email, etc.)
  - Seleccionar centro educativo
  - Seleccionar grado
  - Seleccionar sección
  - Asignar rol (student)
  
- [ ] Formulario para crear profesor
  - Datos personales
  - Seleccionar centro educativo
  - Asignar materias que impartirá
  - Asignar rol (professor)

- [ ] Importación masiva de usuarios
  - Subir CSV
  - Mapear campos
  - Asignar centro/grado automáticamente

#### b) Baja de Usuarios
- [ ] Dar de baja (soft delete)
  - Cambiar status a 'inactive'
  - Mantener historial
  - No eliminar de BD

- [ ] Eliminar permanentemente (hard delete)
  - Solo para casos especiales
  - Confirmación doble
  - Eliminar de BD

#### c) Suspender/Reactivar Usuarios
- [ ] Suspender usuario
  - Cambiar status a 'suspended'
  - Registrar fecha de suspensión
  - Registrar motivo
  - Impedir acceso al sistema

- [ ] Reactivar usuario
  - Cambiar status a 'active'
  - Limpiar fecha y motivo de suspensión
  - Restaurar acceso

#### d) Componentes UI Necesarios
- [ ] `UserManagement.tsx` - Vista principal de gestión
- [ ] `CreateUserForm.tsx` - Formulario de alta
- [ ] `UserList.tsx` - Lista de usuarios con filtros
- [ ] `UserActions.tsx` - Acciones (suspender, dar de baja, etc.)
- [ ] `BulkImport.tsx` - Importación masiva

## 3. Gestión de Contenido

### Subir Contenido (Solo Admin)

**Funcionalidades Necesarias**:

#### a) Subida de Contenido
- [ ] Interfaz para subir archivos
  - PDFs de cursos
  - Materiales didácticos
  - Videos/imágenes
  
- [ ] Organización de contenido
  - Por materia
  - Por grado
  - Por tema

- [ ] Permisos
  - Solo admin puede subir
  - Profesores solo pueden ver/asignar
  - Alumnos solo pueden ver asignado

#### b) Borrar Información
- [ ] Borrar cursos
  - Confirmación
  - Verificar dependencias
  - Opción de archivar vs eliminar

- [ ] Borrar tareas
  - Confirmación
  - Mantener historial de calificaciones

- [ ] Borrar contenido
  - Verificar si está en uso
  - Confirmación doble

#### c) Componentes UI Necesarios
- [ ] `ContentManagement.tsx` - Vista de gestión de contenido
- [ ] `UploadContent.tsx` - Interfaz de subida
- [ ] `ContentList.tsx` - Lista de contenido
- [ ] `DeleteConfirmation.tsx` - Modal de confirmación

## 4. Permisos y Acceso

### Admin Puede Hacer lo Mismo que Profesor

**Funcionalidades Necesarias**:

- [ ] Sistema de roles en frontend
  - Detectar rol de usuario
  - Mostrar/ocultar opciones según rol
  
- [ ] Vistas compartidas
  - Admin puede acceder a vistas de profesor
  - Admin puede ver progreso de alumnos
  - Admin puede calificar tareas

- [ ] Navegación adaptativa
  - Menú diferente para admin vs profesor
  - Admin tiene opciones adicionales

## 5. Backend API Endpoints Necesarios

### Estructura Jerárquica
- [ ] `GET /api/admin/centers` - Listar centros
- [ ] `POST /api/admin/centers` - Crear centro
- [ ] `PUT /api/admin/centers/:id` - Actualizar centro
- [ ] `DELETE /api/admin/centers/:id` - Eliminar centro

- [ ] `GET /api/admin/centers/:id/grades` - Listar grados
- [ ] `POST /api/admin/grades` - Crear grado
- [ ] `PUT /api/admin/grades/:id` - Actualizar grado
- [ ] `DELETE /api/admin/grades/:id` - Eliminar grado

- [ ] `GET /api/admin/grades/:id/sections` - Listar secciones
- [ ] `POST /api/admin/sections` - Crear sección
- [ ] `PUT /api/admin/sections/:id` - Actualizar sección
- [ ] `DELETE /api/admin/sections/:id` - Eliminar sección

- [ ] `GET /api/admin/sections/:id/subjects` - Listar materias
- [ ] `POST /api/admin/subjects` - Crear materia
- [ ] `PUT /api/admin/subjects/:id` - Actualizar materia
- [ ] `DELETE /api/admin/subjects/:id` - Eliminar materia

### Gestión de Usuarios
- [ ] `GET /api/admin/users` - Listar todos los usuarios
- [ ] `POST /api/admin/users` - Crear usuario
- [ ] `PUT /api/admin/users/:id` - Actualizar usuario
- [ ] `DELETE /api/admin/users/:id` - Eliminar usuario
- [ ] `POST /api/admin/users/:id/suspend` - Suspender usuario
- [ ] `POST /api/admin/users/:id/reactivate` - Reactivar usuario
- [ ] `POST /api/admin/users/bulk-import` - Importación masiva

### Gestión de Contenido
- [ ] `POST /api/admin/content/upload` - Subir contenido
- [ ] `GET /api/admin/content` - Listar contenido
- [ ] `DELETE /api/admin/content/:id` - Eliminar contenido
- [ ] `DELETE /api/admin/courses/:id` - Eliminar curso
- [ ] `DELETE /api/admin/tasks/:id` - Eliminar tarea

### Asignaciones
- [ ] `POST /api/admin/assign-professor` - Asignar profesor a materia
- [ ] `GET /api/admin/professors/:id/subjects` - Ver materias de profesor

## 6. Priorización de Desarrollo

### Fase 1: Estructura Jerárquica (Alta Prioridad)
1. Ejecutar `admin-system-schema.sql` ✅
2. Crear endpoints de API para CRUD de estructura
3. Crear componente `HierarchyConfigScreen`
4. Implementar gestión de centros educativos
5. Implementar gestión de grados
6. Implementar gestión de secciones
7. Implementar gestión de materias

### Fase 2: Gestión de Usuarios (Alta Prioridad)
1. Actualizar tabla users con nuevos campos ✅
2. Crear endpoints de gestión de usuarios
3. Crear componente `UserManagement`
4. Implementar alta de usuarios
5. Implementar baja de usuarios
6. Implementar suspensión/reactivación
7. Implementar importación masiva mejorada

### Fase 3: Gestión de Contenido (Media Prioridad)
1. Crear endpoints de contenido
2. Implementar subida de archivos
3. Implementar organización de contenido
4. Implementar eliminación de cursos/tareas

### Fase 4: Permisos y Acceso (Media Prioridad)
1. Implementar sistema de roles en frontend
2. Adaptar navegación según rol
3. Permitir a admin acceder a vistas de profesor

## 7. Archivos a Crear/Modificar

### Nuevos Archivos
- `frontend/src/components/admin/HierarchyConfigScreen.tsx`
- `frontend/src/components/admin/CenterManagement.tsx`
- `frontend/src/components/admin/GradeManagement.tsx`
- `frontend/src/components/admin/SectionManagement.tsx`
- `frontend/src/components/admin/SubjectManagement.tsx`
- `frontend/src/components/admin/UserManagement.tsx`
- `frontend/src/components/admin/ContentManagement.tsx`
- `frontend/src/lib/adminApi.ts`
- `backend/src/routes/admin.ts`
- `backend/src/controllers/adminController.ts`

### Archivos a Modificar
- `frontend/src/components/AdminPanel.tsx` - Agregar navegación a nuevas vistas
- `frontend/src/App.tsx` - Agregar rutas de admin
- `backend/src/index.ts` - Agregar rutas de admin

## 📝 Notas Importantes

1. **Seguridad**: Todas las operaciones de admin deben verificar el rol en backend
2. **Cascada**: Al eliminar un centro, se eliminan grados, secciones y materias
3. **Soft Delete**: Preferir desactivar en lugar de eliminar
4. **Auditoría**: Registrar quién y cuándo hace cambios importantes
5. **Validaciones**: Validar datos en frontend y backend

---

**Siguiente Paso Recomendado**: Comenzar con Fase 1 - Estructura Jerárquica

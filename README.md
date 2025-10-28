# Sysges
# SysGes - Sistema de Gestión de Solicitudes

Backend desarrollado con NestJS para el Sistema de Gestión de Solicitudes de Permisos y Vacaciones.

## 📋 Descripción

Sistema completo de gestión de solicitudes laborales que incluye:
- Vacaciones
- Maternidad y Paternidad
- Incapacidades médicas
- Licencias por luto
- Calamidad doméstica
- Lactancia
- Otros permisos

## 🚀 Tecnologías

- **NestJS** - Framework de Node.js
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **TypeScript** - Lenguaje de programación

## 📦 Requisitos Previos

- Node.js v18+
- PostgreSQL 14+
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sysges_db?schema=public"
DIRECT_URL="postgresql://usuario:contraseña@localhost:5432/sysges_db?schema=public"

# JWT
JWT_SECRET="tu-clave-secreta-super-segura-cambiala-en-produccion"

# Server
PORT=3001
NODE_ENV=development
```

4. **Configurar la base de datos**

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar la base de datos con datos de prueba
npm run prisma:seed
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia el servidor en modo desarrollo con hot-reload

# Producción
npm run build             # Compila el proyecto
npm run start:prod        # Inicia el servidor en modo producción

# Base de datos
npm run prisma:generate   # Genera el cliente de Prisma
npm run prisma:migrate    # Ejecuta las migraciones
npm run prisma:seed       # Pobla la base de datos con datos de prueba
npm run prisma:studio     # Abre Prisma Studio (GUI para la BD)

# Formato y linting
npm run format            # Formatea el código con Prettier
```

## 👥 Usuarios de Prueba

Después de ejecutar el seed, tendrás estos usuarios disponibles:

### Supervisor/Admin
- **Email:** supervisor@comfachoco.com
- **Password:** Admin123!
- **Rol:** Directivo

### Empleados
1. **Juan Pérez**
   - **Email:** juan.perez@comfachoco.com
   - **Password:** Empleado123!
   - **Rol:** Administrativo

2. **Andrea González**
   - **Email:** andrea.gonzalez@comfachoco.com
   - **Password:** Empleado123!
   - **Rol:** Administrativo

## 📚 Endpoints API

Base URL: `http://localhost:3001/api`

### Autenticación

```http
POST /auth/register
POST /auth/login
```

### Solicitudes

```http
GET    /solicitudes/mis-solicitudes    # Solicitudes del usuario autenticado
GET    /solicitudes/pendientes          # Todas las solicitudes pendientes
GET    /solicitudes/aprobadas           # Todas las solicitudes aprobadas
GET    /solicitudes/:id                 # Detalle de una solicitud
POST   /solicitudes                     # Crear nueva solicitud
PUT    /solicitudes/:id/aprobar         # Aprobar solicitud
PUT    /solicitudes/:id/rechazar        # Rechazar solicitud
DELETE /solicitudes/:id                 # Eliminar solicitud
```

### Aprobaciones

```http
POST /aprobaciones                      # Crear aprobación/rechazo
```

### Calendario

```http
GET /calendario/:anio/:mes              # Solicitudes del mes
GET /calendario/estadisticas/:anio/:mes # Estadísticas del mes
```

## 📋 Modelo de Datos

### Principales Entidades

- **TipoEmpleado** - Tipos de empleados (Administrativo, Operativo, Directivo)
- **Empleado** - Información de empleados
- **TipoSolicitud** - Tipos de solicitudes (Vacaciones, Maternidad, etc.)
- **Solicitud** - Solicitudes de permisos/vacaciones
- **Aprobacion** - Aprobaciones de solicitudes
- **SaldoDias** - Control de días disponibles por tipo
- **Politica** - Políticas de permisos por tipo de empleado

### Tipos de Solicitud Configurados

| Tipo | Días | Variable | Requiere Documento |
|------|------|----------|-------------------|
| Vacaciones | 15 días | No | No |
| Maternidad | 126 días (18 semanas) | No | Sí |
| Paternidad | 8 días | No | Sí |
| Incapacidad | Variable | Sí | Sí |
| Luto | 5 días | No | Sí |
| Calamidad | Variable | Sí | Sí |
| Lactancia | 60 min/día | No | Sí |
| Otro | Variable | Sí | No |

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para la autenticación:

1. **Login**: POST `/api/auth/login` retorna un `accessToken`
2. **Usar el token**: Incluir en el header `Authorization: Bearer <token>`
3. **Expiración**: 24 horas

### Ejemplo de uso:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan.perez@comfachoco.com","password":"Empleado123!"}'

# Usar el token
curl http://localhost:3001/api/solicitudes/mis-solicitudes \
  -H "Authorization: Bearer <tu-token-aqui>"
```

## 🗃️ Base de Datos

### Prisma Studio

Para explorar y editar la base de datos visualmente:

```bash
npm run prisma:studio
```

Se abrirá en: `http://localhost:5555`

### Resetear la Base de Datos

```bash
npx prisma migrate reset
npm run prisma:seed
```

⚠️ **Advertencia**: Esto eliminará todos los datos existentes.

## 📝 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── migrations/         # Migraciones de la BD
│   ├── schema.prisma       # Esquema de Prisma
│   └── seed.ts            # Datos de prueba
├── src/
│   ├── auth/              # Autenticación y autorización
│   ├── solicitudes/       # Gestión de solicitudes
│   ├── aprobaciones/      # Gestión de aprobaciones
│   ├── calendario/        # Vista de calendario
│   ├── prisma/            # Servicio de Prisma
│   ├── app.module.ts      # Módulo principal
│   └── main.ts            # Punto de entrada
└── test/                  # Tests E2E
```

## 🔄 Flujo de Trabajo

1. **Empleado crea solicitud**
   - Selecciona tipo de solicitud
   - Define fechas
   - Sistema valida días disponibles
   - Sistema verifica solapamiento de fechas

2. **Supervisor revisa**
   - Puede aprobar o rechazar
   - Puede agregar comentarios
   - Sistema actualiza saldo de días automáticamente

3. **Sistema actualiza**
   - Estado de la solicitud
   - Saldo de días del empleado
   - Calendario de eventos

## 🚨 Validaciones Implementadas

- ✅ Verificación de días disponibles antes de crear solicitud
- ✅ Detección de solapamiento de fechas
- ✅ Validación de fechas (inicio no puede ser después del fin)
- ✅ Solo se pueden aprobar/rechazar solicitudes pendientes
- ✅ Actualización automática de saldos al aprobar

## 🛠️ Desarrollo

### Agregar una nueva migración

```bash
npx prisma migrate dev --name nombre_de_migracion
```

### Actualizar el schema

1. Edita `prisma/schema.prisma`
2. Ejecuta `npm run prisma:migrate`
3. Actualiza el seed si es necesario

## 📊 Base Legal Colombiana

El sistema está basado en la legislación laboral colombiana:

- **Código Sustantivo del Trabajo** - Vacaciones (Art. 186)
- **Ley 1822 de 2017** - Maternidad y Paternidad
- **Ley 776 de 2002** - Incapacidades
- **Ley 1280 de 2009** - Licencia por luto
- **Art. 238 del CST** - Lactancia

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado para COMFACHOCÓ

## 📞 Soporte

Para problemas o preguntas:
- Crea un issue en GitHub
- Contacta al equipo de desarrollo

---

⭐ Si te fue útil este proyecto, considera darle una estrella en GitHub

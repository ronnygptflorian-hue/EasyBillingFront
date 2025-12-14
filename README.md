# Sistema de Facturación Electrónica - República Dominicana

Sistema completo de facturación con soporte para NCF (Números de Comprobantes Fiscales), retenciones de ITBIS e ISR, y gestión integral de clientes, productos y facturas.

## 🚀 Stack Tecnológico

- **Frontend**: Angular 20 (Standalone Components)
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (Email/Password)
- **Estilos**: SCSS con paleta de colores personalizada
- **Build**: Angular CLI

## 📋 Características

### ✅ Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Persistencia de sesión
- Guard para protección de rutas

### ✅ Dashboard
- Tarjetas KPI con métricas principales
- Tabla de facturas recientes
- Accesos rápidos a funciones principales
- Diseño responsive

### ✅ Gestión de Clientes
- CRUD completo de clientes
- Búsqueda y filtrado
- Almacenamiento de RNC/Cédula
- Información de contacto

### ✅ Gestión de Productos
- CRUD completo de productos/servicios
- Códigos de producto
- Precios e ITBIS configurables
- Descripciones detalladas

### ✅ Facturación
- Formulario completo de facturación
- Búsqueda autocomplete de clientes y productos
- Cálculos automáticos de:
  - Subtotales
  - ITBIS (18%)
  - Descuentos
  - Retenciones (ITBIS e ISR)
  - Total final
- Gestión de NCF
- Estados: Pendiente, Pagada, Vencida, Cancelada
- Lista completa de facturas emitidas

### ✅ Configuraciones
- Sección para futuras configuraciones de empresa

## 🎨 Paleta de Colores

El sistema utiliza una paleta de colores profesional:

- **Primario**: Azules (#4299e1 - #1a365d)
- **Neutro**: Grises (#f7fafc - #1a202c)
- **Success**: Verdes (#48bb78)
- **Warning**: Naranjas (#ed8936)
- **Error**: Rojos (#f56565)

## 📁 Estructura del Proyecto

```
src/app/
├── components/
│   ├── auth/
│   │   ├── login.component.{ts,html,scss}
│   │   └── register.component.{ts,html,scss}
│   ├── dashboard/
│   │   └── dashboard.component.{ts,html,scss}
│   ├── clientes/
│   │   └── clientes.component.{ts,html,scss}
│   ├── productos/
│   │   └── productos.component.{ts,html,scss}
│   ├── facturas/
│   │   ├── facturas-list.component.{ts,html,scss}
│   │   └── crear-factura.component.{ts,html,scss}
│   └── configuraciones/
│       └── configuraciones.component.{ts,html,scss}
├── services/
│   ├── supabase.service.ts
│   ├── clientes.service.ts
│   ├── productos.service.ts
│   └── facturas.service.ts
├── models/
│   └── interfaces.ts
├── guards/
│   └── auth.guard.ts
├── app.component.ts
└── app.routes.ts
```

## 🗄️ Base de Datos

### Tablas

1. **empresas**: Información de la empresa del usuario
2. **clientes**: Gestión de clientes
3. **productos**: Catálogo de productos/servicios
4. **facturas**: Registro de facturas emitidas
5. **factura_items**: Detalle de productos en cada factura

### Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- Los usuarios solo acceden a sus propios datos
- Políticas restrictivas por defecto
- Verificación mediante `auth.uid()`

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm start

# Build para producción
npm run build
```

## 🔧 Configuración

Las variables de entorno están en `.env`:

```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📱 Responsive Design

El sistema es completamente responsive con breakpoints en:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Seguridad

- Autenticación requerida para todas las rutas privadas
- RLS habilitado en todas las tablas
- Validación de datos en frontend y backend
- Políticas de acceso restrictivas

## 📝 Próximas Funcionalidades

- Reportes e impresión de facturas
- Configuración de NCF por tipo
- Dashboard con gráficos avanzados
- Exportación a PDF/Excel
- Gestión de inventario
- Notificaciones automáticas

## 👨‍💻 Desarrollo

El proyecto está construido con Angular 20 usando:
- Standalone Components (sin NgModules)
- Signals para gestión de estado
- TypeScript estricto
- SCSS para estilos

## 📄 Licencia

Proyecto privado
"# EasyBillingFront" 

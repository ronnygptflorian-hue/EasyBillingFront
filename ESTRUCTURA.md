# Estructura Completa del Proyecto

## 📂 Árbol de Archivos

```
proyecto/
│
├── 📄 package.json                 # Dependencias del proyecto
├── 📄 angular.json                 # Configuración de Angular
├── 📄 tsconfig.json               # Configuración de TypeScript
├── 📄 .env                        # Variables de entorno (Supabase)
├── 📄 README.md                   # Documentación principal
│
├── 📁 src/
│   ├── 📄 index.html              # HTML principal
│   ├── 📄 main.ts                 # Bootstrap de la aplicación
│   ├── 📄 global_styles.css       # Estilos globales y paleta de colores
│   │
│   └── 📁 app/
│       ├── 📄 app.component.ts           # Componente raíz
│       ├── 📄 app.routes.ts              # Configuración de rutas
│       │
│       ├── 📁 models/
│       │   └── 📄 interfaces.ts          # Interfaces TypeScript
│       │
│       ├── 📁 guards/
│       │   └── 📄 auth.guard.ts          # Guard de autenticación
│       │
│       ├── 📁 services/
│       │   ├── 📄 supabase.service.ts    # Servicio de Supabase
│       │   ├── 📄 clientes.service.ts    # CRUD de clientes
│       │   ├── 📄 productos.service.ts   # CRUD de productos
│       │   └── 📄 facturas.service.ts    # CRUD de facturas
│       │
│       └── 📁 components/
│           │
│           ├── 📁 auth/
│           │   ├── 📄 login.component.ts
│           │   ├── 📄 login.component.html
│           │   ├── 📄 login.component.scss
│           │   ├── 📄 register.component.ts
│           │   ├── 📄 register.component.html
│           │   └── 📄 register.component.scss
│           │
│           ├── 📁 dashboard/
│           │   ├── 📄 dashboard.component.ts
│           │   ├── 📄 dashboard.component.html
│           │   └── 📄 dashboard.component.scss
│           │
│           ├── 📁 clientes/
│           │   ├── 📄 clientes.component.ts
│           │   ├── 📄 clientes.component.html
│           │   └── 📄 clientes.component.scss
│           │
│           ├── 📁 productos/
│           │   ├── 📄 productos.component.ts
│           │   ├── 📄 productos.component.html
│           │   └── 📄 productos.component.scss
│           │
│           ├── 📁 facturas/
│           │   ├── 📄 facturas-list.component.ts
│           │   ├── 📄 facturas-list.component.html
│           │   ├── 📄 facturas-list.component.scss
│           │   ├── 📄 crear-factura.component.ts
│           │   ├── 📄 crear-factura.component.html
│           │   └── 📄 crear-factura.component.scss
│           │
│           └── 📁 configuraciones/
│               ├── 📄 configuraciones.component.ts
│               ├── 📄 configuraciones.component.html
│               └── 📄 configuraciones.component.scss
│
└── 📁 dist/                       # Build de producción
    └── 📁 demo/
```

## 🔄 Flujo de la Aplicación

```
1. Usuario accede a la app
   ↓
2. Redirige a /login (si no autenticado)
   ↓
3. Login exitoso → Redirige a /dashboard
   ↓
4. Dashboard muestra:
   - KPIs principales
   - Facturas recientes
   - Accesos rápidos
   ↓
5. Usuario puede navegar a:
   - /clientes     → Gestionar clientes
   - /productos    → Gestionar productos
   - /facturas     → Ver todas las facturas
   - /facturas/crear → Crear nueva factura
   - /configuraciones → Configurar sistema
```

## 🗃️ Base de Datos (Supabase)

```
Tablas:
│
├── 🔐 auth.users (Supabase Auth)
│   └── Usuarios del sistema
│
├── 🏢 empresas
│   ├── id (uuid)
│   ├── user_id (uuid) → auth.users
│   ├── nombre
│   ├── rnc
│   ├── direccion
│   ├── telefono
│   └── email
│
├── 👥 clientes
│   ├── id (uuid)
│   ├── user_id (uuid) → auth.users
│   ├── nombre
│   ├── rnc_cedula
│   ├── direccion
│   ├── telefono
│   └── email
│
├── 📦 productos
│   ├── id (uuid)
│   ├── user_id (uuid) → auth.users
│   ├── codigo
│   ├── descripcion
│   ├── precio
│   └── itbis
│
├── 📄 facturas
│   ├── id (uuid)
│   ├── user_id (uuid) → auth.users
│   ├── cliente_id (uuid) → clientes
│   ├── ncf
│   ├── fecha
│   ├── subtotal
│   ├── itbis
│   ├── descuento
│   ├── total
│   ├── estado
│   └── notas
│
└── 📋 factura_items
    ├── id (uuid)
    ├── factura_id (uuid) → facturas
    ├── producto_id (uuid) → productos
    ├── descripcion
    ├── cantidad
    ├── precio_unitario
    ├── descuento
    ├── itbis
    ├── total
    ├── tipo_retencion
    ├── itbis_retenido
    └── isr_retenido
```

## 🎯 Componentes por Funcionalidad

### Autenticación
- **LoginComponent**: Inicio de sesión
- **RegisterComponent**: Registro de usuarios

### Gestión
- **DashboardComponent**: Panel principal
- **ClientesComponent**: CRUD de clientes
- **ProductosComponent**: CRUD de productos
- **FacturasListComponent**: Lista de facturas
- **CrearFacturaComponent**: Formulario de facturación
- **ConfiguracionesComponent**: Configuraciones del sistema

## 🔒 Seguridad (RLS Policies)

Cada tabla tiene 4 políticas:
1. **SELECT**: Ver solo datos propios
2. **INSERT**: Crear solo con user_id propio
3. **UPDATE**: Editar solo datos propios
4. **DELETE**: Eliminar solo datos propios

## 🎨 Convenciones de Código

- **Componentes**: PascalCase (LoginComponent)
- **Archivos**: kebab-case (login.component.ts)
- **Variables**: camelCase (currentUser)
- **Constantes**: UPPER_SNAKE_CASE (API_URL)
- **Interfaces**: PascalCase con I prefijo opcional (Cliente)

# Documentación Técnica Completa — Partes Vulnerables de Máquinas

## 📍 Ubicación del Módulo

Todo el código vive dentro de la ruta Angular:

```
Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/
```

La ruta en el navegador es: `http://localhost:4200/mantenimiento/maestros/maquinas-equipos-localidades`

---

## 🗄️ ¿Dónde se Guardan los Datos?

> [!IMPORTANT]
> **No hay base de datos.** Todos los datos se guardan en el **`localStorage`** del navegador del usuario.

### ¿Por qué localStorage?

El proyecto no tiene un backend con operaciones CRUD. Solo existe un `ml_service` (FastAPI en Python) que sirve predicciones de Machine Learning. No hay base de datos SQL ni endpoints REST para guardar/editar/eliminar datos.

Por lo tanto, se usa `localStorage` como almacenamiento temporal en el navegador. Los datos **persisten entre recargas de página** pero se pierden si el usuario limpia la caché del navegador o usa otro navegador/dispositivo.

### Claves de localStorage utilizadas

| Clave | Contenido | Servicio |
|-------|-----------|----------|
| `sizesoft_maquinas` | Array JSON de objetos `Maquina` | `MaquinasService` |
| `sizesoft_partes_maquina` | Array JSON de objetos `ParteMaquina` | `PartesMaquinaService` |

### ¿Cómo funciona?

```
Usuario interactúa con la UI
        ↓
Componente llama al Servicio
        ↓
Servicio lee de localStorage → JSON.parse()
Servicio modifica el array en memoria
Servicio escribe a localStorage → JSON.stringify()
        ↓
Componente recarga la lista desde el servicio
        ↓
UI se actualiza
```

### ¿Cómo migrar a una API real?

Los servicios están diseñados con la misma interfaz que tendría una API REST. Solo habría que reemplazar las llamadas a `localStorage` por llamadas HTTP (`HttpClient`). No se necesita cambiar el componente.

---

## 📁 Archivos Creados/Modificados

| # | Archivo | Acción | Descripción |
|---|---------|--------|-------------|
| 1 | [maquinas.service.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/services/maquinas.service.ts) | **NUEVO** | Servicio de máquinas (CRUD + búsqueda + datos semilla) |
| 2 | [partes-maquina.service.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/services/partes-maquina.service.ts) | **NUEVO** | Servicio de partes (crear, editar, eliminar + validaciones) |
| 3 | [maquinas-equipos-localidades.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.ts) | **REESCRITO** | Componente con toda la lógica de UI |
| 4 | [maquinas-equipos-localidades.html](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.html) | **REESCRITO** | Template HTML con selector, formulario, tabla y modal |
| 5 | [maquinas-equipos-localidades.css](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.css) | **REESCRITO** | Estilos: cards, tabla, inline edit, modal |
| 6 | [angular.json](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/angular.json) | **MODIFICADO** | Budget CSS aumentado de 4kB→16kB |

---

## 📐 Modelos de Datos (Interfaces TypeScript)

### Interface `Maquina`

```typescript
interface Maquina {
    id: string;              // UUID único
    codigo: string;          // Ej: "MAQ-001"
    nombre: string;          // Ej: "Torno CNC"
    descripcion: string;     // Descripción de la máquina
    planta: string;          // Ej: "Planta Principal"
    marca: string;           // Ej: "Haas"
    capacidad: string;       // Ej: "500"
    unidadMedida: string;    // Ej: "kg"
    fechaCompra: string;     // ISO date: "2023-01-15"
    productosQueFabrica: string;
    vendedor: string;
    observaciones: string;
    estado: string;          // "Activo"
    ubicacion: string;       // Ej: "Nave 1 - Sección A"
}
```

### Interface `ParteMaquina`

```typescript
interface ParteMaquina {
    id: string;              // UUID generado con crypto.randomUUID()
    maquinaId: string;       // FK → Maquina.id (relación parte→máquina)
    nombreParte: string;     // Ej: "Rodamiento principal"
    codigoParte: string;     // Ej: "ROD-001"
    creadoEn: string;        // ISO datetime: "2026-02-22T19:30:00.000Z"
}
```

### Relación entre las entidades

```
┌──────────────┐         ┌───────────────────┐
│   Maquina    │ 1 ──── N│   ParteMaquina    │
│              │         │                   │
│ id ──────────┼────────→│ maquinaId         │
│ codigo       │         │ id                │
│ nombre       │         │ nombreParte       │
│ planta       │         │ codigoParte       │
│ ...          │         │ creadoEn          │
└──────────────┘         └───────────────────┘

Restricción de unicidad: (maquinaId + codigoParte) debe ser único
→ No puede haber dos partes con el mismo código en la misma máquina
```

---

## ⚙️ Servicio 1: `MaquinasService`

**Archivo:** [maquinas.service.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/services/maquinas.service.ts) (138 líneas)

**Clave localStorage:** `sizesoft_maquinas`

**Inyección:** `@Injectable({ providedIn: 'root' })` — disponible en toda la app.

### Datos Semilla (Seed Data)

El servicio carga automáticamente 3 máquinas de ejemplo la primera vez que se usa:

| ID | Código | Nombre | Planta |
|----|--------|--------|--------|
| 1 | MAQ-001 | Torno CNC | Planta Principal |
| 2 | MAQ-002 | Fresadora Universal | Planta Principal |
| 3 | MAQ-003 | Prensa Hidráulica | Planta Secundaria |

### Métodos

| Método | Firma | Qué hace |
|--------|-------|----------|
| `constructor()` | — | Llama a `initSeedData()` al instanciar |
| `initSeedData()` | `private` | Si `localStorage` está vacío, inserta las 3 máquinas de ejemplo |
| `getAll()` | `→ Maquina[]` | Lee **todas** las máquinas de localStorage |
| `getById(id)` | `→ Maquina \| undefined` | Busca una máquina por su `id` |
| `searchByCodigo(codigo)` | `→ Maquina \| undefined` | Busca por `codigo` exacto (case-insensitive) |
| `searchByNombre(term)` | `→ Maquina[]` | Filtra por `nombre` o `codigo` que **contenga** el término (case-insensitive) |
| `exists(id)` | `→ boolean` | Retorna `true` si la máquina existe |
| `create(maquina)` | `→ Maquina` | Crea una nueva máquina con UUID generado |
| `update(id, changes)` | `→ Maquina \| null` | Actualiza campos parciales de una máquina |
| `delete(id)` | `→ boolean` | Elimina una máquina por `id` |

---

## ⚙️ Servicio 2: `PartesMaquinaService`

**Archivo:** [partes-maquina.service.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/services/partes-maquina.service.ts) (111 líneas)

**Clave localStorage:** `sizesoft_partes_maquina`

**Inyección:** `@Injectable({ providedIn: 'root' })` — disponible en toda la app.

**Dependencia:** Inyecta `MaquinasService` para validar que la máquina exista.

### Métodos

#### `getByMaquinaId(maquinaId: string): ParteMaquina[]`
- Filtra todas las partes que pertenecen a una máquina específica
- Usado para cargar la tabla de Ficha Técnica

#### `create(maquinaId, nombreParte, codigoParte): { success, error?, part? }`

Crea una nueva parte. Validaciones en este orden:

| # | Validación | Error si falla |
|---|-----------|----------------|
| 1 | ¿La máquina existe? | "La máquina seleccionada no existe en el sistema." |
| 2 | ¿nombreParte tiene contenido? | "El nombre de la parte es obligatorio." |
| 3 | ¿codigoParte tiene contenido? | "El código de la parte es obligatorio." |
| 4 | ¿(maquinaId + codigoParte) es único? | "Ya existe una parte con el código X para esta máquina." |

Si pasa todas las validaciones:
- Genera un `id` con `crypto.randomUUID()`
- Registra la fecha actual en `creadoEn`
- Aplica `.trim()` al nombre y código
- Guarda en localStorage
- Retorna `{ success: true, part: nuevaParte }`

#### `update(partId, nombreParte, codigoParte): { success, error?, part? }`

Edita nombre y/o código de una parte existente. Validaciones:

| # | Validación | Error si falla |
|---|-----------|----------------|
| 1 | ¿nombreParte tiene contenido? | "El nombre de la parte es obligatorio." |
| 2 | ¿codigoParte tiene contenido? | "El código de la parte es obligatorio." |
| 3 | ¿La parte existe con ese partId? | "La parte no fue encontrada." |
| 4 | ¿El nuevo código es único para esa máquina? (excluyendo la parte que se está editando) | "Ya existe una parte con el código X para esta máquina." |

Si pasa todas las validaciones:
- Actualiza sólo `nombreParte` y `codigoParte` (no cambia `maquinaId` ni `creadoEn`)
- Aplica `.trim()` a los valores
- Guarda en localStorage
- Retorna `{ success: true, part: parteActualizada }`

#### `delete(partId: string): boolean`
- Filtra la parte del array y guarda
- Retorna `true` si se eliminó, `false` si no existía

#### `deleteByMaquinaId(maquinaId: string): void`
- Elimina **todas** las partes de una máquina (útil al eliminar una máquina completa)

---

## 🧩 Componente: `MaquinasEquiposLocalidadesComponent`

**Archivo:** [maquinas-equipos-localidades.ts](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.ts) (180 líneas)

**Tipo:** Standalone component (Angular 17+)

**Dependencias inyectadas:**
- `MaquinasService` — para buscar/seleccionar máquinas
- `PartesMaquinaService` — para crear/editar/eliminar partes

### Propiedades del Componente

| Propiedad | Tipo | Propósito |
|-----------|------|-----------|
| `searchTerm` | `string` | Texto del input de búsqueda de máquinas |
| `showDropdown` | `boolean` | Controla si el dropdown de resultados está visible |
| `filteredMaquinas` | `Maquina[]` | Lista de máquinas filtradas por búsqueda |
| `selectedMaquina` | `Maquina \| null` | Máquina actualmente seleccionada |
| `newPart` | `{ nombreParte, codigoParte }` | Datos del formulario de registro |
| `editingPartId` | `string \| null` | ID de la parte en modo edición (`null` = ninguna) |
| `editForm` | `{ nombreParte, codigoParte }` | Datos del formulario de edición inline |
| `deleteConfirm` | `ParteMaquina \| null` | Parte pendiente de confirmar eliminación (`null` = modal cerrado) |
| `partes` | `ParteMaquina[]` | Lista de partes de la máquina seleccionada |
| `notification` | `{ type, message } \| null` | Notificación visible (éxito/error) |

### Métodos del Componente

#### Búsqueda y Selección de Máquinas

| Método | Qué hace |
|--------|----------|
| `onSearch()` | Se ejecuta cada vez que el usuario escribe en el campo de búsqueda. Si está vacío, muestra todas las máquinas; si tiene texto, filtra por nombre/código |
| `selectMaquina(maq)` | Selecciona la máquina clickeada, cierra el dropdown, limpia la búsqueda, y carga sus partes |
| `clearSelection()` | Deselecciona la máquina actual, limpia partes, formularios, y estado de edición |
| `onDocumentClick(event)` | `@HostListener` que cierra el dropdown si se hace click fuera del search-box |

#### CRUD de Partes

| Método | Qué hace |
|--------|----------|
| `loadPartes()` | Lee las partes de la máquina seleccionada desde el servicio y las guarda en `this.partes` |
| `addPart()` | Valida que hay máquina seleccionada, llama a `partesService.create()`, limpia el formulario si éxito, muestra notificación |

#### Edición Inline (US2)

| Método | Qué hace |
|--------|----------|
| `startEdit(parte)` | Guarda el `parte.id` en `editingPartId` y copia nombre/código al `editForm`. La tabla muestra inputs en esa fila |
| `saveEdit()` | Llama a `partesService.update()` con los datos del `editForm`. Si éxito, sale del modo edición y recarga la tabla |
| `cancelEdit()` | Limpia `editingPartId` = `null` → la fila vuelve a modo lectura |

#### Eliminación con Confirmación (US2)

| Método | Qué hace |
|--------|----------|
| `confirmDelete(parte)` | Guarda la parte en `deleteConfirm` → se abre el modal de confirmación |
| `executeDelete()` | Llama a `partesService.delete()`, cierra el modal, recarga la tabla, muestra notificación de éxito |
| `cancelDelete()` | Limpia `deleteConfirm` = `null` → cierra el modal sin eliminar |

#### Helpers

| Método | Qué hace |
|--------|----------|
| `formatDate(isoDate)` | Convierte ISO date a formato legible: "22 feb 2026" (locale `es-CO`) |
| `showNotification(type, message)` | Muestra notificación de éxito o error. Las de éxito se auto-ocultan a los 5 segundos |

---

## 🖥️ Template HTML

**Archivo:** [maquinas-equipos-localidades.html](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.html) (194 líneas)

### Estructura visual

```
┌─────────────────────────────────────────────────┐
│        MÁQUINAS — Partes Vulnerables            │ ← Título
├─────────────────────────────────────────────────┤
│ 🏭 Seleccionar Máquina        (header verde)   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔍 Buscar máquina...                        │ │ ← Input búsqueda
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ MAQ-001  Torno CNC    Planta Principal  │ │ │ ← Dropdown
│ │ │ MAQ-002  Fresadora    Planta Principal  │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ [✅ Máquina seleccionada: MAQ-001 Torno ✕]  │ │ ← Badge
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ ✅/⚠️ Mensaje de notificación                   │ ← Notificación
├─────────────────────────────────────────────────┤
│ 🔧 Registrar Parte Vulnerable (header azul)    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│ │ Nombre *     │ │ Código *     │ │💾Registrar│ │ ← Formulario
│ └──────────────┘ └──────────────┘ └──────────┘ │
├─────────────────────────────────────────────────┤
│ 📋 Ficha Técnica              (header oscuro)  │
│ ┌───┬──────────────┬────────┬────────┬────────┐ │
│ │ # │ Nombre       │ Código │ Fecha  │Acciones│ │ ← Tabla
│ │ 1 │ Rodamiento   │ROD-001 │ 22 feb │ ✏️ 🗑️ │ │
│ │ 2 │ Banda        │BND-002 │ 22 feb │ ✏️ 🗑️ │ │
│ └───┴──────────────┴────────┴────────┴────────┘ │
│ Total de partes: 2                              │
├─────────────────────────────────────────────────┤
│                                                 │
│   ┌──────────── MODAL ────────────┐             │
│   │ ⚠️ Confirmar Eliminación      │             │ ← Modal confirmación
│   │                               │             │
│   │ ¿Está seguro que desea        │             │
│   │ eliminar "Rodamiento"         │             │
│   │ (código: ROD-001)?            │             │
│   │                               │             │
│   │ Esta acción no se puede       │             │
│   │ deshacer.                     │             │
│   │                               │             │
│   │    [Cancelar] [Sí, eliminar]  │             │
│   └───────────────────────────────┘             │
└─────────────────────────────────────────────────┘
```

### Modo edición inline en la tabla

Cuando el usuario hace click en ✏️, la fila cambia de:
```
│ 1 │ Rodamiento principal │ ROD-001 │ 22 feb│ ✏️ 🗑️ │  ← modo lectura
```
A:
```
│ 1 │ [___________________]│[_______]│ 22 feb│ ✔️ ✖️ │  ← modo edición
     ↑ input editable       ↑ input    (fondo azul)
```

---

## 🎨 CSS

**Archivo:** [maquinas-equipos-localidades.css](file:///c:/Users/workgroup/Desktop/Sizesoft/SizeSoft/Maintenance_Module/src/app/mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades.css) (710+ líneas)

### Secciones del CSS

| Sección | Qué estiliza |
|---------|-------------|
| Page Layout | Contenedor principal, título centrado |
| Shared Card Styles | Base compartida para las 3 cards (selector, form, ficha) |
| Machine Selector | Input de búsqueda, dropdown, badge de selección |
| Notification | Alertas de éxito (verde) y error (naranja) con animación `slideIn` |
| Register Part Form | Inputs alineados horizontalmente con botón de registro |
| Ficha Técnica Table | Tabla con zebra stripes, hover, código con badge |
| **Inline Edit** | Fila con fondo azul `#e3f2fd`, inputs con borde azul |
| **Confirmation Modal** | Overlay oscuro, caja centrada con animación `scaleIn`, botones Cancelar (gris) y Confirmar (rojo) |
| Responsive | Layout vertical en pantallas < 700px |

### Headers de cada card

| Card | Gradiente |
|------|-----------|
| Seleccionar Máquina | Verde: `#e8f5e9 → #c8e6c9` |
| Registrar Parte | Azul: `#e3f2fd → #bbdefb` |
| Ficha Técnica | Oscuro: `#1a237e → #283593` (texto blanco) |

---

## ✅ User Stories Implementadas

### US1: Register and Search Machine Parts

| Criterio | Implementación |
|----------|---------------|
| Formulario con nombre + código de parte | Formulario con 2 inputs + botón Registrar |
| No registrar sin máquina válida | Botón deshabilitado + validación en `addPart()` |
| Partes asociadas a máquina existente | FK `maquinaId` en `ParteMaquina` |
| Mensaje de confirmación al guardar | Notificación verde: "Parte registrada exitosamente" |
| Partes en ficha técnica | Tabla con #, Nombre, Código, Fecha, Acciones |
| Código único por máquina | Validación en `create()`: `(maquinaId + codigoParte)` |

### US2: Delete and Change Machine Parts

| Criterio | Implementación |
|----------|---------------|
| Editar nombre y código | Click ✏️ → fila se convierte en inputs → ✔️ guardar |
| Validar código no duplicado al editar | `update()` verifica unicidad excluyendo la parte actual |
| Eliminar parte de la ficha | Click 🗑️ → modal de confirmación |
| Confirmar antes de eliminar | Modal: "¿Está seguro?" + botones Cancelar / Sí, eliminar |
| Mensaje de éxito al actualizar | "Parte actualizada exitosamente" |
| Mensaje de éxito al eliminar | "Parte eliminada exitosamente" |
| Mensajes de error claros | "Ya existe una parte con el código X para esta máquina" |

---

## 🔄 Flujo Completo de Datos

### Registrar una parte
```
1. Usuario selecciona "Torno CNC" del dropdown
2. Usuario llena: Nombre="Rodamiento", Código="ROD-001"
3. Click "Registrar Parte"
4. Componente llama: partesService.create("1", "Rodamiento", "ROD-001")
5. Servicio valida: ¿máquina "1" existe? ✅
6. Servicio valida: ¿campos llenos? ✅
7. Servicio valida: ¿(1, ROD-001) es único? ✅
8. Servicio genera UUID, crea objeto ParteMaquina
9. Servicio lee localStorage["sizesoft_partes_maquina"]
10. Servicio agrega la parte al array
11. Servicio escribe localStorage["sizesoft_partes_maquina"]
12. Componente limpia formulario, recarga tabla, muestra notificación
```

### Editar una parte
```
1. Click ✏️ en la fila "Rodamiento" (id="abc-123")
2. startEdit() guarda editingPartId="abc-123", editForm={nombre, codigo}
3. La fila cambia a inputs editables (fondo azul)
4. Usuario modifica el nombre a "Rodamiento Delantero"
5. Click ✔️
6. saveEdit() llama: partesService.update("abc-123", "Rodamiento Delantero", "ROD-001")
7. Servicio valida campos, busca la parte, verifica unicidad del código
8. Servicio actualiza el objeto en el array y guarda en localStorage
9. Componente sale del modo edición, recarga tabla, muestra notificación
```

### Eliminar una parte
```
1. Click 🗑️ en la fila "Rodamiento"
2. confirmDelete() guarda la parte en deleteConfirm → se abre modal
3. Modal muestra: "¿Seguro que desea eliminar Rodamiento (ROD-001)?"
4. Si click "Cancelar" → cancelDelete() cierra el modal, no hace nada
5. Si click "Sí, eliminar" → executeDelete():
   a. Llama partesService.delete("abc-123")
   b. Servicio filtra la parte del array y guarda en localStorage
   c. Cierra modal, recarga tabla, muestra notificación de éxito
```

---

## 📦 Modificación a angular.json

Se modificó el budget de CSS en la configuración de producción:

```diff
-{ "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
+{ "type": "anyComponentStyle", "maximumWarning": "16kB", "maximumError": "32kB" }
```

Esto fue necesario porque los estilos del componente exceden los 4kB por defecto de Angular.

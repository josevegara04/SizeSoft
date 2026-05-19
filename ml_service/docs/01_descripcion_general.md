Especificación Técnica y Funcional: Módulo de Gestión de Mantenimiento SOP

1. Introducción al Módulo y Control de Acceso

El Módulo de Gestión de Mantenimiento SOP, desarrollado bajo el marco del entorno de pruebas SISO, constituye una arquitectura modular diseñada para el ciclo de vida de activos industriales. Este sistema facilita el mapeo relacional de componentes, repuestos y mano de obra técnica para garantizar la integridad operativa de la planta.

El acceso a las capas transaccionales y de configuración está condicionado a un esquema de Persistencia de Estado de Sesión. Es un requisito técnico mandatorio que el usuario se autentique mediante el protocolo de inicio de sesión definido antes de interactuar con las funcionalidades de gestión de activos. El propósito central es centralizar la administración de inventarios técnicos y la ejecución de planes de mantenimiento preventivo, correctivo y reactivo.

2. Definición de Catálogos Maestros (Configuración)

Esta sección define las entidades base y los esquemas de datos requeridos para la operatividad del sistema. Cada submódulo de configuración implementa capacidades CRUD (Create, Read, Update, Delete) y una validación de estado de formulario denominada Form Reset (Limpiar) para asegurar la limpieza de los buffers de entrada.

2.1 Listado de Partes

Funciona como un Registro Centralizado con Patrones de Consulta (Query Filter) integrados al inventario corporativo. Permite la identificación unívoca de componentes mediante una clave primaria (Part_Code).

* Campos de Datos: Código de la parte (PK), Nombre de la parte, Atributos técnicos.
* Funcionalidad Técnica: El sistema permite la recuperación masiva de registros (Llamada a base de datos global) o la inserción de nuevas tuplas. La interfaz implementa un patrón de búsqueda asistida mediante modales para la vinculación rápida entre partes y activos.

2.2 Gestión de Repuestos

Administra la consistencia de inventario base y la relación de dependencia con el Listado de Partes.

* Campos de Datos: Código de la parte (FK), Nombre de la parte (Carga automática), Cantidad en Stock.
* Lógica de Carga Automática: El sistema implementa un disparador (trigger) en el evento de entrada del código; al validar un Part_Code existente, realiza un Asynchronous Data Fetching para recuperar el nombre de la parte directamente desde el esquema de la base de datos, eliminando la redundancia y el error humano. Posee una función de Form Reset para inicializar los campos de captura.

2.3 Causas de Mantenimiento

Define la taxonomía de las paradas de planta. Este catálogo clasifica el origen de las intervenciones y su impacto en la disponibilidad del activo.

* Campos de Datos: ID (System-generated), Código, Nombre de la Causa, Falla, Descripción, Tipo de Mantenimiento, Estado (Boolean: Activo/Inactivo).
* Gestión de Estado: El campo "Activo/Inactivo" define el Estado Operativo del Activo. Técnicamente, este flag determina si la máquina se encuentra en operación nominal o en estado de parada técnica. Las actualizaciones de estado persisten de forma inmediata en la base de datos tras la validación de cambios.

2.4 Planes de Mantenimiento

Define las directrices estratégicas de mantenimiento y la frecuencia de ejecución vinculada a identificadores de activos específicos.

* Campos de Datos: ID de mantenimiento, Nombre del plan, Descripción, Código de máquina, Tiempo (Frecuencia en días/Integer), Tipo de mantenimiento.
* Funcionalidad: El sistema utiliza el campo "Tiempo" como una variable numérica para el cálculo de ciclos preventivos. Los registros pueden ser actualizados o eliminados (Hard Delete) según los requerimientos del plan de planta.

2.5 Registro de Operarios (Personal Técnico)

Gestiona el catálogo de recursos humanos técnicos asignados a la ejecución de órdenes.

Tipo de Atributo	Campos de Datos	Lógica de Negocio / Persistencia
Campos Obligatorios	Nombre, Apellido, Cédula, Cargo	Requeridos para la integridad referencial en Órdenes de Servicio.
Campos Opcionales	Especialidad, Teléfono	Datos de contacto para coordinación logística.
Estado de Actividad	Activo / Inactivo	Implementa Soft-Deletion logic: permite deshabilitar al operario sin eliminar su historial transaccional.

3. Transacciones y Flujos de Proceso

La capa transaccional gestiona la interconectividad de datos en tiempo real, transformando los catálogos maestros en registros de ejecución.

3.1 Programación de Mantenimientos

Subsistema encargado de la orquestación de la agenda técnica. Permite la creación y actualización de calendarios preventivos.

* Lógica de ID: Al persistir un nuevo registro de programación, el sistema realiza una asignación automática de un ID de Programación (Auto-increment/UUID).
* Parámetros Críticos: Para el procesamiento exitoso, el sistema exige un ID de mantenimiento preexistente, una Fecha Real de Inicio y una Frecuencia (Días).

3.2 Órdenes de Servicio (Ejecución y Cierre)

Este componente representa el núcleo transaccional del sistema.

* Transactional Hook (Reducción de Stock): El sistema implementa un hook de base de datos donde el uso de repuestos dentro de una orden descuenta automáticamente las cantidades del inventario. Si el repuesto no cuenta con existencias suficientes o no existe en el catálogo, el flujo de cierre de la orden debe ser bloqueado para mantener la integridad de los saldos.
* Requisitos de Cierre de Orden: Es mandatorio el mapeo de Código de Orden, Código de Máquina, Intervalo Temporal (Inicio/Fin), Tipo de Mantenimiento, Repuestos Consumidos y el Operario asignado.

3.3 Búsquedas Asistidas

El sistema utiliza un patrón de Lookup Modals para la recuperación de información histórica. Esta funcionalidad distingue explícitamente entre:

1. Actividades: Consulta de registros de ejecución.
2. Causas: Consulta de catálogos de falla y estados de activos. Estas búsquedas facilitan la inyección de datos validados en los formularios de órdenes y programación.

4. Auditoría y Trazabilidad (Bitácora de Planta)

La Bitácora de Planta es el módulo de auditoría administrativa encargado de capturar la telemetría de las acciones del usuario para asegurar la trazabilidad total del sistema.

Cada transacción o actualización de configuración genera un registro que incluye:

* Identidad del Sujeto: Usuario que ejecuta la acción (ej. Malarenas).
* Descripción del Evento: Detalle de la modificación (ej. "Actualización de causa de mantenimiento").
* Marca de Tiempo (Timestamp): Registro preciso del sistema (ej. 16:27).

Este registro es inmutable y sirve como fuente primaria para auditorías de cumplimiento y control operativo.

5. Reglas de Negocio y Validaciones Técnicas

Para asegurar la consistencia del modelo de datos y el entrenamiento de modelos de IA, se definen las siguientes reglas críticas:

1. Integridad Transaccional de Stock: El descuento de inventario de repuestos es una operación atómica vinculada a la ejecución de Órdenes de Servicio.
2. Validación de Lookup Automático: La carga de nombres en el módulo de repuestos es una función de búsqueda por código (Part_Code) que debe ejecutarse de forma previa a la edición de cantidades.
3. Restricción de Nulidad en Operarios: El motor de base de datos rechazará cualquier inserción en el catálogo de operarios que omita Nombre, Apellido, Cédula o Cargo.
4. Dependencia de Estado de Activo: El flag de disponibilidad de la máquina (Activo/Inactivo) se deriva estrictamente de la clasificación de la causa de mantenimiento seleccionada.
5. Generación de Identificadores: Los IDs de programación de mantenimiento son generados por el sistema tras la persistencia del registro; no son editables por el usuario final.
6. Validación de Formulario (Limpiar): Todos los módulos de entrada deben implementar una función de reset que limpie el estado local de la interfaz sin afectar la persistencia de la base de datos.

# AGENTS.md

## Resumen ejecutivo

Este repositorio contiene el desarrollo del módulo de mantenimiento de SizeSoft ERP. No es un proyecto único de Angular: la raíz agrupa tres áreas principales:

1. `Maintenance_Module/`: frontend Angular 21 del módulo de mantenimiento.
2. `ml_service/`: microservicio FastAPI para chatbot con RAG sobre documentación local.
3. `Database/`: scripts SQL y artefactos del modelo relacional.

También existe `docker-compose.yml` para levantar frontend y chatbot juntos en desarrollo.

## Estructura del repositorio

```text
.
├── Maintenance_Module/          # App Angular
├── ml_service/                  # Servicio FastAPI + ChromaDB + Groq
├── Database/
│   ├── Mant/                    # Scripts SQL del módulo de mantenimiento
│   └── Rmd/                     # Modelo relacional y scripts asociados
├── images/                      # Material visual del proyecto
├── docker-compose.yml           # Orquestación local frontend + chatbot
├── README.md                    # README mínimo de la raíz
└── DOCUMENTACION_PARTES_VULNERABLES.md
```

## Arquitectura funcional

### 1. Frontend Angular

Ubicación: `Maintenance_Module/`

Tecnología principal:

- Angular 21.1.x
- Angular standalone components
- `@ng-bootstrap/ng-bootstrap`
- `ngx-cookie-service`
- `ngx-markdown` y `marked`
- Vitest para pruebas

La app modela el módulo de mantenimiento bajo la ruta principal `/mantenimiento`, con dos grandes áreas:

- `maestros`
- `transacciones`

Rutas confirmadas en `src/app/app.routes.ts`:

- `/login`
- `/mantenimiento/maestros/maquinas-equipos-localidades`
- `/mantenimiento/maestros/repuestos`
- `/mantenimiento/maestros/causas-mantenimiento`
- `/mantenimiento/maestros/actividades-mantenimiento`
- `/mantenimiento/maestros/mantenimientos`
- `/mantenimiento/maestros/operarios`
- `/mantenimiento/maestros/tipos-mantenimiento`
- `/mantenimiento/transacciones/programacion-mantenimientos`
- `/mantenimiento/transacciones/ordenes-servicio`
- `/mantenimiento/transacciones/mantenimientos`
- `/mantenimiento/transacciones/bitacora-planta`

La app usa un `LoginComponent`, pero el guard existe y actualmente no está activado en la ruta principal. Además, `environment.skipLogin` permite cambiar el flujo inicial entre `login` y `mantenimiento`.

### 2. Integración ERP / API externa

El frontend no habla principalmente con un backend local propio del módulo. `src/app/services/api.service.ts` centraliza llamadas hacia servicios externos del ERP SizeSoft.

Endpoints verificados:

- Desarrollo: `https://localhost:44371/...`
- Pruebas: `https://erpapipruebas.azurewebsites.net/...`

Principales rutas usadas por el frontend:

- `POST /users/authenticate`
- `POST /api/Query`
- `POST /api/Query/Save`
- otros endpoints XML/PDF/Otros heredados del ERP

La autenticación se maneja con token y cookie `ERPCookie{CodiComp}{Usuario}`.

Conclusión práctica: buena parte del comportamiento real depende de servicios externos no versionados en este repositorio.

### 3. Chatbot / servicio ML

Ubicación: `ml_service/`

Tecnología principal:

- FastAPI
- Uvicorn
- Groq SDK
- ChromaDB
- `sentence-transformers`
- `langchain` / `langchain-community`

Flujo del servicio:

1. Al arrancar, `chat.py` llama `ingest()`.
2. `ingest.py` lee `ml_service/docs/*.md`.
3. Los documentos se separan por bloques dobles de línea.
4. Se indexan en ChromaDB persistente bajo `./chroma_db`.
5. `main.py` expone `POST /chat` y `GET /health`.
6. El endpoint de chat consulta contexto relevante y genera respuesta con Groq.

Detalles relevantes:

- El modelo usado es `llama-3.1-8b-instant`.
- El prompt fuerza respuestas en español.
- El chatbot solo debe responder con base en la documentación cargada.
- Se mantiene historial en memoria por `session_id`.
- CORS permite `http://localhost:4200`.

## Comandos de trabajo

### Frontend Angular

Desde `Maintenance_Module/`:

```bash
npm install
npm start
```

Comandos disponibles en `package.json`:

```bash
npm start
npm run build
npm run watch
npm test
npm run test:integration
```

Notas:

- `npm start` ejecuta `ng serve`.
- El `docker-compose.yml` lo arranca con `--host 0.0.0.0 --poll 2000`.
- `angular.json` define `development` y `production`.
- El build usa `@angular/build:application`.

### Chatbot FastAPI

Desde `ml_service/`:

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Dependencias declaradas:

- `fastapi`
- `uvicorn`
- `groq`
- `python-dotenv`
- `chromadb`
- `sentence-transformers`
- `langchain`
- `langchain-community`

Variables operativas esperadas:

- `GROQ_API_KEY`

Observación:

- `docker-compose.yml` referencia `ml_service/.env`, pero ese archivo no está versionado.

### Docker Compose

Desde la raíz:

```bash
docker compose up --build
```

Servicios definidos:

- `frontend` en puerto `4200`
- `chatbot` en puerto `8000`

## Pruebas

### Unitarias / frontend

El proyecto Angular usa Vitest a través de `ng test`.

Archivos de prueba detectados:

- `src/app/app.spec.ts`
- `src/app/login/login.component.spec.ts`
- `src/app/navbar/navbar.spec.ts`
- `src/app/services/api.service.spec.ts`

### Integración contra API externa

Existe una suite en:

- `Maintenance_Module/integration-tests/po-api.integration.test.ts`

Se ejecuta con:

```bash
npm run test:integration
```

Variables de entorno soportadas por esa suite:

- `PO_API_BASE_URL`
- `PO_API_COMPANY`
- `PO_API_USER`
- `PO_API_PASSWORD`
- `PO_API_SECURITY_CODE`
- `PO_API_TOKEN`
- `PO_API_QUERY_BODY`
- `PO_API_SAVE_BODY`

La suite:

- autentica contra el backend ERP real
- opcionalmente ejecuta `Query`
- opcionalmente ejecuta `Query/Save`

Conclusión práctica: estas pruebas no son autocontenidas; dependen de credenciales y del backend externo.

## Base de datos

Ubicación principal: `Database/`

### `Database/Mant`

Contiene scripts específicos del módulo de mantenimiento.

`01_tablas.sql` crea o valida, entre otras, estas tablas:

- `Mant.tblmanCausMant`
- `Mant.tblmanActiMant`
- `Mant.tblmanMantActiDeta`
- `Mant.tblmanCritic`

`02_sp_save.sql` contiene procedimientos `spSave...` para operaciones CRUD, al menos sobre:

- causas de mantenimiento
- actividades de mantenimiento

Patrón general observado:

- reciben JSON
- validan existencia
- insertan / actualizan / eliminan
- retornan un resultado con `success` y `message`

### `Database/Rmd`

Incluye artefactos del modelo relacional:

- `relational_model_diagram.mwb`
- `relational_model_diagram.png`
- `script.sql`

## Documentación de negocio

El chatbot se alimenta de documentación Markdown en `ml_service/docs/`:

- `01_descripcion_general.md`
- `02_listado_partes.md`
- `03_repuestos.md`
- `04_causas_mantenimiento.md`
- `05_ordenes_servicio.md`
- `06_preguntas_frecuentes.md`

Hay además un documento amplio en raíz:

- `DOCUMENTACION_PARTES_VULNERABLES.md`

## Convenciones y patrones del código

### Frontend

- Predomina el uso de componentes standalone.
- Hay fuerte acoplamiento a `ApiService`.
- El estado de autenticación y mucha configuración de menú se guarda en propiedades mutables del servicio.
- Se usa cookie para persistir token.
- Existen nombres heredados del ERP y mezcla de español/abreviaturas de negocio.

Implicación para cambios:

- Antes de refactorizar `ApiService`, revisar impacto transversal.
- Varias pantallas probablemente dependen del mismo contrato de `Query`/`Save`.
- El código combina lógica nueva del módulo con infraestructura heredada del ERP.

### Backend chatbot

- El índice vectorial se puebla automáticamente si la colección está vacía.
- La persistencia del historial de conversación es solo en memoria.
- No hay autenticación en los endpoints del chatbot.

Implicación para cambios:

- reiniciar el servicio borra el historial
- cambios en docs pueden requerir limpiar `chroma_db` si se necesita reindexación completa

## Riesgos y dependencias externas

Puntos importantes para cualquier agente que trabaje aquí:

1. El comportamiento central del frontend depende de endpoints externos de SizeSoft ERP.
2. El login real no es completamente verificable sin credenciales y backend disponible.
3. Las pruebas de integración requieren secretos y payloads no versionados.
4. `ml_service/.env` no está en el repo.
5. El guard de autenticación existe, pero la protección en rutas está comentada.
6. `README.md` en raíz es mínimo y no documenta la arquitectura real.
7. El pipeline GitHub encontrado (`.github/workflows/autopullreques.yml`) solo crea PR automático en pushes; no ejecuta validaciones.

## Estado del workspace

Al momento de inspección, `git status --short` no reportó cambios pendientes.

## Guía operativa para agentes

### Cuando trabajes en frontend

- Ejecuta desde `Maintenance_Module/`.
- Revisa primero `src/app/app.routes.ts` y `src/app/services/api.service.ts`.
- Si un cambio toca formularios o guardado, valida si usa `Query` o `Query/Save`.
- No asumas backend local del ERP; el contrato real está fuera del repo.

### Cuando trabajes en chatbot

- Ejecuta desde `ml_service/`.
- Verifica `GROQ_API_KEY`.
- Si cambias documentación base, considera regenerar el índice de Chroma.
- Revisa `main.py`, `chat.py` e `ingest.py` juntos; están fuertemente acoplados.

### Cuando trabajes en SQL

- Revisa `Database/Mant/` para cambios del módulo.
- Mantén compatibilidad con tablas `Mant.tblmanTipoMant` y `Mant.tblmanManten`, que ya existen y son referenciadas.
- Por el momento, no están actualizados los scripts con la base de datos. Así que no tomar como referencia los scripts que se hayan en el repo de la base de datos

### Antes de dar por terminado un cambio

- Si es frontend: corre al menos `npm test` cuando sea viable.
- Si toca integración ERP: documenta claramente qué no se pudo validar sin credenciales.
- Si toca chatbot: valida `GET /health` y, si hay entorno listo, una llamada a `POST /chat`.

## Archivos clave

- `README.md`
- `docker-compose.yml`
- `Maintenance_Module/package.json`
- `Maintenance_Module/angular.json`
- `Maintenance_Module/src/app/app.routes.ts`
- `Maintenance_Module/src/app/services/api.service.ts`
- `Maintenance_Module/src/environments/environment.ts`
- `Maintenance_Module/integration-tests/po-api.integration.test.ts`
- `ml_service/main.py`
- `ml_service/chat.py`
- `ml_service/ingest.py`
- `ml_service/requirements.txt`
- `Database/Mant/01_tablas.sql`
- `Database/Mant/02_sp_save.sql`

## Limitaciones de esta documentación

Este archivo refleja únicamente información verificada en el repositorio local. No documenta:

- contratos completos del backend ERP externo
- credenciales, secretos o archivos `.env` no versionados
- despliegues reales de producción
- flujos de negocio no representados en código o scripts presentes


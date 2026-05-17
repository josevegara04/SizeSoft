import { beforeAll, describe, expect, it } from 'vitest';

type QueryParam = Record<string, unknown>;
type ApiRow = Record<string, unknown>;

const apiBaseUrl = process.env.PO_API_BASE_URL ?? 'https://erpapipruebas.azurewebsites.net';
const company = process.env.PO_API_COMPANY ?? '';
const user = process.env.PO_API_USER ?? '';
const password = process.env.PO_API_PASSWORD ?? '';
const securityCode = process.env.PO_API_SECURITY_CODE ?? '';
const explicitToken = process.env.PO_API_TOKEN ?? '';
const queryBodyJson = process.env.PO_API_QUERY_BODY ?? '';
const saveBodyJson = process.env.PO_API_SAVE_BODY ?? '';
const hasAuthConfig = Boolean(company && user && password);
const hasExecutableConfig = Boolean((hasAuthConfig || explicitToken) && company);

const describeIf = hasExecutableConfig ? describe : describe.skip;

// Convierte payloads definidos por variables de entorno en objetos reales
// para reutilizar la misma suite con distintos escenarios de integración.
function parsePayload(json: string): QueryParam[] | null {
  if (!json) {
    return null;
  }

  const parsed = JSON.parse(json) as QueryParam[];
  return injectRuntimeValues(parsed) as QueryParam[];
}

// Reemplaza placeholders por credenciales/valores presentes en el entorno
// de ejecución para no hardcodear secretos dentro de la prueba.
function injectRuntimeValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => injectRuntimeValues(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, injectRuntimeValues(item)]),
    ) as T;
  }

  if (value === '__COMPANY__') {
    return company as T;
  }

  if (value === '__USER__') {
    return user as T;
  }

  if (value === '__PASSWORD__') {
    return password as T;
  }

  if (value === '__SECURITY_CODE__') {
    return securityCode as T;
  }

  return value;
}

// Inyecta compañía y token en requests reutilizables antes de llamar a la API.
function withToken(payload: QueryParam[] | null, token: string): QueryParam[] | null {
  if (!payload) {
    return null;
  }

  return payload.map((item) => ({
    ...item,
    CodiComp: item.CodiComp === '__COMPANY__' || !item.CodiComp ? company : item.CodiComp,
    Token: item.Token === '__TOKEN__' || !item.Token ? token : item.Token,
  }));
}

// Wrapper mínimo sobre fetch para centralizar el formato de requests JSON.
async function postJson(url: string, body: unknown, token?: string): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

// Las respuestas exitosas del backend deben ser arreglos con al menos una fila
// y nunca reportar expiración o invalidez del token de sesión.
function expectValidArrayResponse(rows: ApiRow[]) {
  expect(Array.isArray(rows)).toBe(true);
  expect(rows.length).toBeGreaterThan(0);

  const firstRow = rows[0];
  const message = firstRow?.Messag ?? firstRow?.messag;
  expect(message).not.toBe('Token Inválido');
}

// La suite solo se ejecuta cuando existen credenciales reales en variables de
// entorno; en ausencia de ellas se omite para no fallar en CI local.
describeIf('PO API integration', () => {
  let token = '';
  let authResponse: ApiRow[] = [];
  let usedExplicitToken = false;

  beforeAll(async () => {
    if (explicitToken) {
      token = explicitToken;
      usedExplicitToken = true;
      return;
    }

    // Se autentica una sola vez y el token obtenido se reutiliza en el resto
    // de casos para reducir tiempo y mantener consistencia entre llamadas.
    const response = await postJson(`${apiBaseUrl}/users/authenticate`, {
      CodiComp: company,
      Id: user,
      NombUsua: '',
      PassUsua: password,
      UserToken: '',
      CodiSegu: securityCode,
      menuApp: 'ERP',
      Ip: '',
      City: '',
      Region: '',
      PostCode: '',
      Longit: '',
      Latitu: '',
      Token: '',
    });

    expect(response.ok).toBe(true);
    authResponse = (await response.json()) as ApiRow[];
    expectValidArrayResponse(authResponse);

    const authMessage = String(authResponse[0]?.Messag ?? authResponse[0]?.messag ?? '');
    expect(authMessage).toBe('OK');

    token = String(authResponse[0]?.Token ?? '');
    expect(token).not.toBe('');
  });

  it('should authenticate successfully against the PO API', () => {
    if (usedExplicitToken) {
      expect(token).not.toBe('');
      return;
    }

    // Verifica la precondición base de la suite: credenciales válidas.
    expect(String(authResponse[0]?.Messag ?? '')).toBe('OK');
    expect(String(authResponse[0]?.CodiComp ?? '')).toBe(company);
  });

  it('should execute the configured parts list Query request', async () => {
    // Si no se configuró payload de consulta, el caso se vuelve no operativo
    // y termina sin fallar para permitir ejecuciones parciales.
    const queryPayload = withToken(parsePayload(queryBodyJson), token);

    if (!queryPayload) {
      return;
    }

    // Ejecuta una consulta parametrizada tal como lo haría la app en runtime.
    const response = await postJson(`${apiBaseUrl}/api/Query`, queryPayload, token);
    expect(response.ok).toBe(true);

    const rows = (await response.json()) as ApiRow[];
    expectValidArrayResponse(rows);
  });

  it('should execute the configured parts list Query/Save request', async () => {
    // Igual que la consulta normal, pero cubriendo el endpoint que muta datos.
    const savePayload = withToken(parsePayload(saveBodyJson), token);

    if (!savePayload) {
      return;
    }

    const response = await postJson(`${apiBaseUrl}/api/Query/Save`, savePayload, token);
    expect(response.ok).toBe(true);

    const rows = (await response.json()) as ApiRow[];
    expectValidArrayResponse(rows);
  });
});

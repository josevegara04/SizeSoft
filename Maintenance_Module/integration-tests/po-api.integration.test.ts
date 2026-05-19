import { afterAll, beforeAll, describe, expect, it } from 'vitest';

type Primitive = string | number | boolean | null;
type JsonValue = Primitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type ApiRow = Record<string, unknown>;
type QueryParam = Record<string, unknown>;

type ApiEndpoint = 'query' | 'save';

interface RequestScenario {
  name: string;
  endpoint: ApiEndpoint;
  body: JsonValue;
}

interface FlowScenario {
  name: string;
  steps: RequestScenario[];
}

const apiBaseUrl = process.env.PO_API_BASE_URL ?? 'https://erpapipruebas.azurewebsites.net';
const company = process.env.PO_API_COMPANY ?? 'PMC1';
const user = process.env.PO_API_USER ?? 'ManuelArenas';
const password = process.env.PO_API_PASSWORD ?? 'ManAre1490%&';
const securityCode = process.env.PO_API_SECURITY_CODE ?? '';
const explicitToken = process.env.PO_API_TOKEN ?? '';
const appVersion = process.env.PO_API_APP_VERSION ?? '1.4.12';
const flowScenariosJson = process.env.PO_API_FLOW_SCENARIOS ?? '';

const hasAuthConfig = Boolean(company && user && password);
const hasExplicitSession = Boolean(company && user && explicitToken);
const hasExecutableConfig = hasAuthConfig || hasExplicitSession;
const describeIf = hasExecutableConfig ? describe : describe.skip;

const defaultQueryScenarios: RequestScenario[] = [
  {
    name: 'should load tipo de parte for maquinas/equipos/localidades',
    endpoint: 'query',
    body: [
      { CodiCons: 'TipoPart', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load partes list for maquinas/equipos/localidades',
    endpoint: 'query',
    body: [
      { CodiCons: 'ListPart', NombPara: 'Comp', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load causas de mantenimiento',
    endpoint: 'query',
    body: [
      { CodiCons: 'CausMant', NombPara: 'Comp', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load actividades de mantenimiento',
    endpoint: 'query',
    body: [
      { CodiCons: 'ActiMant', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load mantenimientos',
    endpoint: 'query',
    body: [
      { CodiCons: 'Manten', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load mantenimiento detail assignments',
    endpoint: 'query',
    body: [
      { CodiCons: 'MantDeta', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load operarios',
    endpoint: 'query',
    body: [
      { CodiCons: 'Operar', NombPara: 'Compañía', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load programacion de mantenimientos',
    endpoint: 'query',
    body: [
      { CodiCons: 'ProgMant', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
  {
    name: 'should load ordenes de servicio',
    endpoint: 'query',
    body: [
      { CodiCons: 'OrdeMant', NombPara: 'Codigo Compañia', Valor: '__COMPANY__', CodiComp: '__COMPANY__', Token: '__TOKEN__', Report: '0' },
    ],
  },
];

let runtimeCompany = company;
let runtimeUser = user;

function parseFlowScenarios(json: string): FlowScenario[] {
  if (!json.trim()) {
    return [];
  }

  const parsed = JSON.parse(json) as FlowScenario[];
  return parsed.map((scenario) => ({
    ...scenario,
    steps: scenario.steps.map((step) => ({
      ...step,
      body: injectRuntimeValues(step.body),
    })),
  }));
}

function injectRuntimeValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => injectRuntimeValues(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, injectRuntimeValues(item)]),
    ) as T;
  }

  switch (value) {
    case '__COMPANY__':
      return runtimeCompany as T;
    case '__USER__':
      return runtimeUser as T;
    case '__PASSWORD__':
      return password as T;
    case '__SECURITY_CODE__':
      return securityCode as T;
    case '__TODAY__':
      return new Date().toISOString().slice(0, 10) as T;
    default:
      return value;
  }
}

function withSession<T>(value: T, token: string): T {
  if (Array.isArray(value)) {
    return value.map((item) => withSession(item, token)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (item === '__TOKEN__') {
          return [key, token];
        }

        return [key, withSession(item, token)];
      }),
    ) as T;
  }

  return (value === '__TOKEN__' ? token : value) as T;
}

function buildUrl(endpoint: ApiEndpoint): string {
  return endpoint === 'save' ? `${apiBaseUrl}/api/Query/Save` : `${apiBaseUrl}/api/Query`;
}

async function postJson(url: string, body: unknown, token?: string, includeAuthHeader = false): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(30000),
    headers: {
      'Content-Type': 'application/json',
      ...(includeAuthHeader && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function expectValidArrayResponse(rows: ApiRow[], allowEmpty = false) {
  expect(Array.isArray(rows)).toBe(true);

  if (!allowEmpty) {
    expect(rows.length).toBeGreaterThan(0);
  }

  if (rows.length === 0) {
    return;
  }

  const firstRow = rows[0];
  const message = firstRow?.Messag ?? firstRow?.messag;
  expect(message).not.toBe('Token Inválido');
}

async function executeScenarioStep(step: RequestScenario, token: string): Promise<ApiRow[]> {
  const body = withSession(injectRuntimeValues(step.body), token);
  const response = await postJson(buildUrl(step.endpoint), body, token, false);
  const responseText = await response.text();

  expect(response.ok, [
    `Scenario: ${step.name}`,
    `Status: ${response.status} ${response.statusText}`,
    `URL: ${buildUrl(step.endpoint)}`,
    `Request body: ${JSON.stringify(body)}`,
    `Response body: ${responseText}`,
  ].join('\n')).toBe(true);

  const rows = JSON.parse(responseText) as ApiRow[];
  expectValidArrayResponse(rows, step.endpoint === 'save');
  return rows;
}

const flowScenarios = parseFlowScenarios(flowScenariosJson);

describeIf('PO API integration full session flow', () => {
  let token = '';
  let authResponse: ApiRow[] = [];
  let usedExplicitToken = false;

  beforeAll(async () => {
    if (explicitToken) {
      token = explicitToken;
      usedExplicitToken = true;
      return;
    }

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
    runtimeCompany = String(authResponse[0]?.CodiComp ?? company);
    runtimeUser = String(authResponse[0]?.CodiUsua ?? authResponse[0]?.Id ?? user);
  });

  afterAll(async () => {
    if (!token || !company || !user) {
      return;
    }

    const closeBody = [
      {
        CodiCons: 'ClosUser',
        NombPara: 'Compañía',
        Valor: company,
        CodiComp: runtimeCompany,
        Token: token,
        Report: '0',
      },
      {
        CodiCons: 'ClosUser',
        NombPara: 'Codigo',
        Valor: runtimeUser,
        CodiComp: '',
        Token: '',
        Report: '0',
      },
    ];

    const closeResponse = await postJson(`${apiBaseUrl}/api/Query`, closeBody, undefined, false);
    expect(closeResponse.ok).toBe(true);

    const closeRows = (await closeResponse.json()) as ApiRow[];
    expectValidArrayResponse(closeRows, true);
  });

  it('should authenticate successfully and keep the session token available', () => {
    expect(token).not.toBe('');

    if (usedExplicitToken) {
      return;
    }

    expect(String(authResponse[0]?.Messag ?? '')).toBe('OK');
    expect(String(authResponse[0]?.CodiComp ?? '')).toBe(runtimeCompany);
  });

  for (const scenario of defaultQueryScenarios) {
    it(scenario.name, async () => {
      const rows = await executeScenarioStep(scenario, token);
      expectValidArrayResponse(rows);
    });
  }

  for (const scenario of flowScenarios) {
    it(`should execute configured flow: ${scenario.name}`, async () => {
      for (const step of scenario.steps) {
        await executeScenarioStep(step, token);
      }
    });
  }
});

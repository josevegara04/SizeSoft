export interface TipoParteOption {
  id: number;
  nombre: string;
}

export const TIPOS_PARTE_TEMPORALES: TipoParteOption[] = [
  { id: 5, nombre: 'Filtración' }
];

export function normalizeTipoParteName(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function findTipoParteByName(nombre: string): TipoParteOption | undefined {
  const normalizedName = normalizeTipoParteName(nombre);
  return TIPOS_PARTE_TEMPORALES.find(
    tipoParte => normalizeTipoParteName(tipoParte.nombre) === normalizedName
  );
}

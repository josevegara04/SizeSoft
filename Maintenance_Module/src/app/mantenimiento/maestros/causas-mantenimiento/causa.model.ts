export interface Causa {
  id: number;
  cause_name: string;
  cause_code: string;
  cause_type: 'Mantenimiento' | 'Falla';
  description: string;
}

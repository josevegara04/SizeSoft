import { Routes } from '@angular/router';
import { MantenimientoLayoutComponent } from './mantenimiento/mantenimiento-layout';
import { MaestrosComponent } from './mantenimiento/maestros/maestros';
import { MaquinasEquiposLocalidadesComponent } from './mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades';
import { RepuestosComponent } from './mantenimiento/maestros/repuestos/repuestos';
import { TransaccionesComponent } from './mantenimiento/transacciones/transacciones';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mantenimiento/maestros/maquinas-equipos-localidades' },
  {
    path: 'mantenimiento',
    component: MantenimientoLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'maestros/maquinas-equipos-localidades' },
      {
        path: 'maestros',
        component: MaestrosComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'maquinas-equipos-localidades' },
          { path: 'maquinas-equipos-localidades', component: MaquinasEquiposLocalidadesComponent },
          { path: 'repuestos', component: RepuestosComponent },
        ],
      },
      { path: 'transacciones', component: TransaccionesComponent },
    ],
  },
];

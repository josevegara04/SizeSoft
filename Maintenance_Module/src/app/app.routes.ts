import { Routes } from '@angular/router';
import { MantenimientoLayoutComponent } from './mantenimiento/mantenimiento-layout';
import { MaestrosComponent } from './mantenimiento/maestros/maestros';
import { TransaccionesComponent } from './mantenimiento/transacciones/transacciones';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mantenimiento/maestros' },
  {
    path: 'mantenimiento',
    component: MantenimientoLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'maestros' },
      { path: 'maestros', component: MaestrosComponent },
      { path: 'transacciones', component: TransaccionesComponent },
    ],
  },
];

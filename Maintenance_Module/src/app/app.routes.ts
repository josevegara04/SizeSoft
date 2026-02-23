import { Routes } from '@angular/router';
import { MantenimientoLayoutComponent } from './mantenimiento/mantenimiento-layout';
import { DashboardComponent } from './mantenimiento/dashboard/dashboard'; 
import { MaestrosComponent } from './mantenimiento/maestros/maestros';
import { ActividadesMantenimientoComponent } from './mantenimiento/maestros/actividades-mantenimiento/actividades-mantenimiento';
import { CausasMantenimientoComponent } from './mantenimiento/maestros/causas-mantenimiento/causas-mantenimiento';
import { MaquinasEquiposLocalidadesComponent } from './mantenimiento/maestros/maquinas-equipos-localidades/maquinas-equipos-localidades';
import { MantenimientosComponent } from './mantenimiento/maestros/mantenimientos/mantenimientos';
import { OperariosComponent } from './mantenimiento/maestros/operarios/operarios';
import { RepuestosComponent } from './mantenimiento/maestros/repuestos/repuestos';
import { TiposMantenimientoComponent } from './mantenimiento/maestros/tipos-mantenimiento/tipos-mantenimiento';
import { TransaccionesComponent } from './mantenimiento/transacciones/transacciones';
import { BitacoraPlantaComponent } from './mantenimiento/transacciones/bitacora-planta/bitacora-planta';
import { MantenimientosTransComponent } from './mantenimiento/transacciones/mantenimientos-trans/mantenimientos-trans';
import { OrdenesServicioComponent } from './mantenimiento/transacciones/ordenes-servicio/ordenes-servicio';
import { ProgramacionMantenimientosComponent } from './mantenimiento/transacciones/programacion-mantenimientos/programacion-mantenimientos';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mantenimiento/maestros/maquinas-equipos-localidades' },
  {
    path: 'mantenimiento',
    component: MantenimientoLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'maestros/maquinas-equipos-localidades' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
        ],
      },
      {
        path: 'maestros',
        component: MaestrosComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'maquinas-equipos-localidades' },
          { path: 'maquinas-equipos-localidades', component: MaquinasEquiposLocalidadesComponent },
          { path: 'repuestos', component: RepuestosComponent },
          { path: 'causas-mantenimiento', component: CausasMantenimientoComponent },
          { path: 'actividades-mantenimiento', component: ActividadesMantenimientoComponent },
          { path: 'mantenimientos', component: MantenimientosComponent },
          { path: 'operarios', component: OperariosComponent },
          { path: 'tipos-mantenimiento', component: TiposMantenimientoComponent },
        ],
      },
      {
        path: 'transacciones',
        component: TransaccionesComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'programacion-mantenimientos' },
          { path: 'programacion-mantenimientos', component: ProgramacionMantenimientosComponent },
          { path: 'ordenes-servicio', component: OrdenesServicioComponent },
          { path: 'mantenimientos', component: MantenimientosTransComponent },
          { path: 'bitacora-planta', component: BitacoraPlantaComponent },
        ],
      },
    ],
  },
];

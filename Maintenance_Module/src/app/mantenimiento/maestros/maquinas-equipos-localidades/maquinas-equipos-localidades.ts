import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PartesMaquinaService } from './services/partes-maquina.service';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-maquinas-equipos-localidades',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './maquinas-equipos-localidades.html',
  styleUrl: './maquinas-equipos-localidades.css',
})
export class MaquinasEquiposLocalidadesComponent {

  private readonly partesService = inject(PartesMaquinaService);
  private readonly cookieService = inject(CookieService);
  private readonly apiService = inject(ApiService);

  // 🔹 Variables del formulario
  nombreParte: string = '';
  codigoParte: string = '';
  codigoMaquina: string = '';

  // 🔹 Notificaciones
  notification: { type: 'success' | 'error'; message: string } | null = null;

  // 🔹 Método principal (POST al backend)
  addPart(): void {
    // Validación básica
    if (!this.nombreParte || !this.codigoParte || !this.codigoMaquina) {
      this.showNotification('error', 'Todos los campos son obligatorios');
      return;
    }

    const cookieKey = 'ERPCookie' + this.apiService.clsUser.CodiComp + this.apiService.clsUser.Id.toUpperCase();
    let token = this.cookieService.get(cookieKey);

    if (!token) {
      token = this.apiService.lstrToken;
    }

    const body = {
      NumeroParte: Number(this.codigoParte),
      NombreParte: this.nombreParte,
      idTipoParte: 2, // TODO: hacerlo dinámico luego
      CodiMaqu: this.codigoMaquina,

      CodiComp: 'PMC1',
      Entidad: 300,
      Token: token,
      Accion: 1
    };

    this.partesService.savePart(body).subscribe({
      next: (res: any) => {
        console.log('Respuesta backend:', res);

        const message = res?.[0]?.Messag || 'Operación realizada';
        const msg = message.toLowerCase();

        const isSuccess = msg.includes('creada') || msg.includes('actualizada') || msg.includes('eliminada');

        if (isSuccess) {
          this.showNotification('success', message);
          console.log(this.notification);
          this.resetForm();
        } else {
          this.showNotification('error', message);
        }
      },
      error: (err) => {
        console.error('Error backend:', err);
        this.showNotification('error', 'Error al registrar la parte');
      }
    });
  }

  // 🔹 Limpiar formulario
  private resetForm(): void {
    this.nombreParte = '';
    this.codigoParte = '';
    this.codigoMaquina = '';
  }

  // 🔹 Notificaciones
  private showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };

    if (type === 'success') {
      setTimeout(() => {
        if (this.notification?.message === message) {
          this.notification = null;
        }
      }, 4000);
    }
  }
}

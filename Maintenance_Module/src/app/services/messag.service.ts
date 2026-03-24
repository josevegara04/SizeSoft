import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Mensaje {
    texto: string;
    tipo: number; // 0 = info, 1 = éxito, 2 = error/advertencia
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class MessagService {

    private mensajes: Mensaje[] = [];
    private idCounter = 0;

    // Observable para que los componentes escuchen los mensajes
    private mensajesSubject = new Subject<Mensaje[]>();
    public mensajes$ = this.mensajesSubject.asObservable();

    // Observable para abrir el MsgboxComponent desde cualquier parte
    private msgBoxSubject = new Subject<{ tipo: number; texto: string }>();
    public msgBox$ = this.msgBoxSubject.asObservable();

    /**
     * Agrega un mensaje a la lista de notificaciones.
     * @param texto  Texto del mensaje
     * @param tipo   0 = info, 1 = éxito, 2 = error/advertencia (por defecto 0)
     */
    add(texto: string, tipo: number = 0): void {
        if (!texto || texto.trim() === '') return;

        const mensaje: Mensaje = {
            texto,
            tipo,
            id: this.idCounter++
        };
        this.mensajes.push(mensaje);
        this.mensajesSubject.next([...this.mensajes]);

        // Auto-remover mensajes de info/éxito después de 5 segundos
        if (tipo !== 2) {
            setTimeout(() => this.remove(mensaje.id), 5000);
        }
    }

    /**
     * Limpia todos los mensajes activos.
     */
    clear(): void {
        this.mensajes = [];
        this.mensajesSubject.next([]);
    }

    /**
     * Elimina un mensaje específico por su ID.
     */
    remove(id: number): void {
        this.mensajes = this.mensajes.filter(m => m.id !== id);
        this.mensajesSubject.next([...this.mensajes]);
    }

    /**
     * Dispara la apertura del MsgboxComponent modal.
     * @param tipo   2 = advertencia/error, 1 = éxito, 0 = info
     * @param texto  Texto a mostrar en el modal
     */
    fnMsgBox(tipo: number, texto: string): void {
        this.msgBoxSubject.next({ tipo, texto });
    }

    /**
     * Retorna la copia actual de los mensajes (uso sincrónico si se necesita).
     */
    getMensajes(): Mensaje[] {
        return [...this.mensajes];
    }
}

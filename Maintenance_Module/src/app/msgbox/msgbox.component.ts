import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-msgbox',
    standalone: true,
    imports: [NgClass],
    template: `
    <div class="msgbox-wrapper">
      <!-- Header -->
      <div class="msgbox-header" [ngClass]="headerClass">
        <span class="msgbox-icon">{{ icon }}</span>
        <span class="msgbox-title">{{ title }}</span>
        <button class="msgbox-close" (click)="cerrar()">✕</button>
      </div>
 
      <!-- Body -->
      <div class="msgbox-body">
        <p>{{ texto }}</p>
      </div>
 
      <!-- Footer -->
      <div class="msgbox-footer">
        <button class="msgbox-btn" [ngClass]="btnClass" (click)="cerrar()">
          Aceptar
        </button>
      </div>
    </div>
  `,
    styles: [`
    .msgbox-wrapper {
      font-family: 'Segoe UI', sans-serif;
      border-radius: 8px;
      overflow: hidden;
      min-width: 300px;
    }
 
    .msgbox-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      font-weight: 600;
      font-size: 15px;
      color: #fff;
    }
 
    .msgbox-header.tipo-error {
      background-color: #c0392b;
    }
 
    .msgbox-header.tipo-info {
      background-color: #2980b9;
    }
 
    .msgbox-header.tipo-exito {
      background-color: #27ae60;
    }
 
    .msgbox-icon {
      font-size: 18px;
    }
 
    .msgbox-title {
      flex: 1;
    }
 
    .msgbox-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
 
    .msgbox-close:hover {
      opacity: 1;
    }
 
    .msgbox-body {
      padding: 20px 18px 10px;
      font-size: 14px;
      color: #333;
      background: #fff;
    }
 
    .msgbox-body p {
      margin: 0;
      line-height: 1.5;
    }
 
    .msgbox-footer {
      display: flex;
      justify-content: flex-end;
      padding: 10px 18px 16px;
      background: #fff;
    }
 
    .msgbox-btn {
      padding: 8px 24px;
      border: none;
      border-radius: 5px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      color: #fff;
      transition: opacity 0.2s;
    }
 
    .msgbox-btn:hover {
      opacity: 0.85;
    }
 
    .msgbox-btn.tipo-error {
      background-color: #c0392b;
    }
 
    .msgbox-btn.tipo-info {
      background-color: #2980b9;
    }
 
    .msgbox-btn.tipo-exito {
      background-color: #27ae60;
    }
  `]
})
export class MsgboxComponent implements OnInit {

    /**
     * Título que se muestra en el header del modal.
     * El LoginComponent lo setea como: modalRef.componentInstance.title = 'Message Box'
     */
    @Input() title: string = 'Message Box';

    /**
     * Tipo de mensaje:
     *   0 = info (azul)
     *   1 = éxito (verde)
     *   2 = error / advertencia (rojo)
     * Se puede setear desde fuera: modalRef.componentInstance.tipo = 2
     */
    @Input() tipo: number = 0;

    /**
     * Texto del mensaje a mostrar en el body.
     * Se puede setear desde fuera: modalRef.componentInstance.texto = 'Su sesión ha expirado'
     * También lo puede recibir el MessagService vía fnMsgBox()
     */
    @Input() texto: string = '';

    icon: string = 'ℹ️';
    headerClass: string = 'tipo-info';
    btnClass: string = 'tipo-info';

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit(): void {
        this.aplicarTipo();
    }

    private aplicarTipo(): void {
        switch (this.tipo) {
            case 2: // Error / advertencia
                this.icon = '⚠️';
                this.headerClass = 'tipo-error';
                this.btnClass = 'tipo-error';
                break;
            case 1: // Éxito
                this.icon = '✅';
                this.headerClass = 'tipo-exito';
                this.btnClass = 'tipo-exito';
                break;
            default: // Info
                this.icon = 'ℹ️';
                this.headerClass = 'tipo-info';
                this.btnClass = 'tipo-info';
                break;
        }
    }

    cerrar(): void {
        this.activeModal.close();
    }
}
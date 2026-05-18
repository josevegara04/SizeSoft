import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenServicioService } from '../orden-servicio.service';
import { ApiService } from '../../../../services/api.service';
import { SidebarService } from '../../../../side-bar/sidebar.service';

@Component({
  selector: 'app-orden-servicio-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './orden-servicio-modal.component.html',
  styleUrls: ['./orden-servicio-modal.component.css']
})
export class OrdenServicioModalComponent implements OnInit {
  private readonly excelMimeType = 'application/vnd.ms-excel;charset=utf-8;';

  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<any>();

  results: any[] = [];
  isExporting = false;

  filterCodiOrd: string = '';
  filterCodiMaqu: string = '';
  filterTipoMant: string = '';
  filterEstado: string = '';

  constructor(
    private ordenService: OrdenServicioService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.handleSearch();
  }

  get filteredResults() {
    return this.results.filter(item =>
      (!this.filterCodiOrd || item.CodiOrdMaqu?.toLowerCase().includes(this.filterCodiOrd.toLowerCase())) &&
      (!this.filterCodiMaqu || item.CodiMaqu?.toLowerCase().includes(this.filterCodiMaqu.toLowerCase())) &&
      (!this.filterTipoMant || item.TipoMant?.toLowerCase().includes(this.filterTipoMant.toLowerCase())) &&
      (!this.filterEstado || item.NombreEstado?.toLowerCase().includes(this.filterEstado.toLowerCase()))
    );
  }

  handleSearch(): void {
    const body = [{
      CodiCons: 'OrdeMant',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0'
    }];

    this.ordenService.search(body).subscribe({
      next: (res) => {
        this.results = Array.isArray(res) ? [...res] : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.results = [];
      }
    });
  }

  exportOrdersToExcel(): void {
    if (this.isExporting) {
      return;
    }

    if (this.filteredResults.length === 0) {
      this.sidebarService.addLog('No hay órdenes para exportar');
      return;
    }

    this.isExporting = true;

    try {
      const rows = this.filteredResults.map((item) => ({
        'Código Orden': item.CodiOrdMaqu ?? '',
        'Código Máquina': item.CodiMaqu ?? '',
        'Fecha Inicio': this.formatExcelDate(item.Fecha_inicio),
        'Fecha Programada': this.formatExcelDate(item.FechaProgramada),
        'Fecha Fin': this.formatExcelDate(item.fechaFin),
        'Tipo Mantenimiento': item.TipoMant ?? '',
        'ID Mantenimiento': item.idMantenimiento ?? '',
        'Estado': item.NombreEstado ?? '',
        'ID Estado': item.IdEsta ?? '',
        'Repuestos': this.formatRepuestosForExport(item.Repuestos),
      }));

      const xmlContent = this.buildExcelXml(rows);
      const blob = new Blob([`\ufeff${xmlContent}`], { type: this.excelMimeType });
      const companyCode = this.apiService.clsUser.CodiComp || 'empresa';
      const fileName = `ordenes-servicio-${companyCode}-${this.getExportDateStamp()}.xls`;

      this.downloadBlob(blob, fileName);
      this.sidebarService.addLog(`Archivo exportado: ${fileName}`);
    } catch {
      this.sidebarService.addLog('Error al exportar las órdenes');
    } finally {
      this.isExporting = false;
    }
  }

  selectRow(item: any): void {
    this.select.emit(item);
  }

  cerrarModal(): void {
    this.close.emit();
  }

  private formatExcelDate(value: unknown): string {
    if (!value) {
      return '';
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  private formatRepuestosForExport(raw: unknown): string {
    if (!raw) {
      return '';
    }

    try {
      const repuestos = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(repuestos)) {
        return '';
      }

      return repuestos
        .map((item) => `ID ${item.idRepues ?? ''} x ${item.cantid ?? ''}`)
        .join(', ');
    } catch {
      return String(raw);
    }
  }

  private buildExcelXml(rows: Record<string, unknown>[]): string {
    const headers = Object.keys(rows[0]);
    const headerCells = headers
      .map((header) => `<Cell ss:StyleID="header"><Data ss:Type="String">${this.escapeXml(header)}</Data></Cell>`)
      .join('');

    const dataRows = rows
      .map((row) => {
        const cells = headers
          .map((header) => `<Cell><Data ss:Type="String">${this.escapeXml(String(row[header] ?? ''))}</Data></Cell>`)
          .join('');

        return `<Row>${cells}</Row>`;
      })
      .join('');

    return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#D9EAF2" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="OrdenesServicio">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private getExportDateStamp(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    return `${yyyy}${mm}${dd}-${hh}${min}`;
  }
}

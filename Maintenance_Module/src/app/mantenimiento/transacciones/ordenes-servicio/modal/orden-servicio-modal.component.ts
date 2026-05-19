import { Component, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenServicioService } from '../orden-servicio.service';
import { ApiService } from '../../../../services/api.service';
import { SidebarService } from '../../../../side-bar/sidebar.service';
import { firstValueFrom } from 'rxjs';

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
  private sheetNameRegistry = new Set<string>();

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

  async exportOrdersToExcel(): Promise<void> {
    if (this.isExporting) {
      return;
    }

    if (this.filteredResults.length === 0) {
      this.sidebarService.addLog('No hay órdenes para exportar');
      return;
    }

    this.isExporting = true;

    try {
      const maintenanceDetails = await this.loadMaintenanceDetails();
      this.sheetNameRegistry.clear();

      const summaryRows = this.filteredResults.map((item) => ({
        'Código Orden': item.CodiOrdMaqu ?? '',
        'Código Máquina': item.CodiMaqu ?? '',
        'Fecha Inicio': this.formatExcelDate(item.Fecha_inicio),
        'Fecha Programada': this.formatExcelDate(item.FechaProgramada),
        'Fecha Fin': this.formatExcelDate(item.fechaFin),
        'Tipo Mantenimiento': item.TipoMant ?? '',
        'ID Mantenimiento': item.idMantenimiento ?? '',
        'Estado': item.NombreEstado ?? '',
        'Actividades': this.formatActivitiesForExport(maintenanceDetails.get(Number(item.idMantenimiento))?.Actividades),
        'Causas': this.formatCausesForExport(maintenanceDetails.get(Number(item.idMantenimiento))?.Causas),
        'Repuestos': this.formatRepuestosForExport(item.Repuestos),
      }));

      const xmlContent = this.buildWorkbookXml(summaryRows, maintenanceDetails);
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

  private formatActivitiesForExport(raw: unknown): string {
    const actividades = this.parseJsonArray(raw);
    if (actividades.length === 0) {
      return '';
    }

    return actividades
      .map((item) => item.NombActi ?? item.NombreActividad ?? item.CodiActi ?? '')
      .filter((item) => !!item)
      .join(', ');
  }

  private formatCausesForExport(raw: unknown): string {
    const causas = this.parseJsonArray(raw);
    if (causas.length === 0) {
      return '';
    }

    return causas
      .map((item) => item.NombCaus ?? item.NombreCausa ?? item.CodiCaus ?? '')
      .filter((item) => !!item)
      .join(', ');
  }

  private parseJsonArray(raw: unknown): any[] {
    if (Array.isArray(raw)) {
      return raw;
    }

    if (!raw || typeof raw !== 'string') {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async loadMaintenanceDetails(): Promise<Map<number, any>> {
    const body = [{
      CodiCons: 'MantDeta',
      NombPara: 'Codigo Compañia',
      Valor: this.apiService.clsUser.CodiComp,
      CodiComp: this.apiService.clsUser.CodiComp,
      Token: this.apiService.lstrToken,
      Report: '0',
    }];

    const response = await firstValueFrom(this.ordenService.search(body));
    const rows = Array.isArray(response) ? response : [];
    const detailMap = new Map<number, any>();

    rows.forEach((item: any) => {
      const id = Number(item.idMantenimiento ?? item.IdMantenimiento ?? 0);
      if (id > 0) {
        detailMap.set(id, item);
      }
    });

    return detailMap;
  }

  private buildWorkbookXml(summaryRows: Record<string, unknown>[], maintenanceDetails: Map<number, any>): string {
    const orderSheetNames = new Map<string, string>();
    const indexRows = this.filteredResults.map((item) => {
      const orderCode = String(item.CodiOrdMaqu ?? '');
      const sheetName = this.createUniqueSheetName(orderCode || 'Orden');
      orderSheetNames.set(orderCode, sheetName);

      return {
        orderCode,
        machineCode: String(item.CodiMaqu ?? ''),
        estado: String(item.NombreEstado ?? ''),
        sheetName,
      };
    });

    const worksheets = [
      this.buildSummaryWorksheet(summaryRows),
      this.buildIndexWorksheet(indexRows),
      ...this.filteredResults.map((item) =>
        this.buildOrderDetailWorksheet(item, maintenanceDetails.get(Number(item.idMantenimiento)), orderSheetNames.get(String(item.CodiOrdMaqu ?? '')) || 'Orden')
      ),
    ].join('');

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
    <Style ss:ID="section">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1F6F8B" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="label">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#F3F7F9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="link">
      <Font ss:Color="#0563C1" ss:Underline="Single"/>
    </Style>
  </Styles>
  ${worksheets}
</Workbook>`;
  }

  private buildSummaryWorksheet(rows: Record<string, unknown>[]): string {
    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Sin datos'];
    const headerCells = headers
      .map((header) => `<Cell ss:StyleID="header"><Data ss:Type="String">${this.escapeXml(header)}</Data></Cell>`)
      .join('');

    const dataRows = rows.length > 0
      ? rows.map((row) => {
          const cells = headers
            .map((header) => `<Cell><Data ss:Type="String">${this.escapeXml(String(row[header] ?? ''))}</Data></Cell>`)
            .join('');

          return `<Row>${cells}</Row>`;
        }).join('')
      : `<Row><Cell><Data ss:Type="String">No hay órdenes para exportar</Data></Cell></Row>`;

    return `<Worksheet ss:Name="Resumen Ordenes">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>`;
  }

  private buildIndexWorksheet(indexRows: Array<{ orderCode: string; machineCode: string; estado: string; sheetName: string }>): string {
    const rows = indexRows.length > 0
      ? indexRows.map((item) => `<Row>
          <Cell ss:StyleID="link" ss:HRef="#${this.escapeXml(item.sheetName)}!A1"><Data ss:Type="String">${this.escapeXml(item.orderCode)}</Data></Cell>
          <Cell><Data ss:Type="String">${this.escapeXml(item.machineCode)}</Data></Cell>
          <Cell><Data ss:Type="String">${this.escapeXml(item.estado)}</Data></Cell>
          <Cell><Data ss:Type="String">Abrir detalle</Data></Cell>
        </Row>`).join('')
      : `<Row><Cell><Data ss:Type="String">No hay órdenes para indexar</Data></Cell></Row>`;

    return `<Worksheet ss:Name="Indice Ordenes">
    <Table>
      <Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">Número de Orden</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Código Máquina</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Estado</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Acceso</Data></Cell>
      </Row>
      ${rows}
    </Table>
  </Worksheet>`;
  }

  private buildOrderDetailWorksheet(order: any, detail: any, sheetName: string): string {
    const actividades = this.parseJsonArray(detail?.Actividades);
    const causas = this.parseJsonArray(detail?.Causas);
    const repuestos = this.parseJsonArray(order?.Repuestos);

    const headerRows = [
      `<Row><Cell ss:StyleID="section"><Data ss:Type="String">Detalle de la orden ${this.escapeXml(String(order.CodiOrdMaqu ?? ''))}</Data></Cell></Row>`,
      this.buildLabelValueRow('Código Orden', order.CodiOrdMaqu),
      this.buildLabelValueRow('Código Máquina', order.CodiMaqu),
      this.buildLabelValueRow('Fecha Inicio', this.formatExcelDate(order.Fecha_inicio)),
      this.buildLabelValueRow('Fecha Programada', this.formatExcelDate(order.FechaProgramada)),
      this.buildLabelValueRow('Fecha Fin', this.formatExcelDate(order.fechaFin)),
      this.buildLabelValueRow('Tipo Mantenimiento', order.TipoMant),
      this.buildLabelValueRow('ID Mantenimiento', order.idMantenimiento),
      this.buildLabelValueRow('Estado', order.NombreEstado),
      `<Row></Row>`,
      `<Row><Cell ss:StyleID="section"><Data ss:Type="String">Repuestos</Data></Cell></Row>`,
      `<Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">ID Repuesto</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Cantidad</Data></Cell>
      </Row>`,
      this.buildSimpleTableRows(repuestos, [
        { key: 'idRepues', fallback: '' },
        { key: 'cantid', fallback: '' },
      ]),
      `<Row></Row>`,
      `<Row><Cell ss:StyleID="section"><Data ss:Type="String">Actividades de mantenimiento</Data></Cell></Row>`,
      `<Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">ID Actividad</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Código</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Nombre</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Descripción</Data></Cell>
      </Row>`,
      this.buildSimpleTableRows(actividades, [
        { key: 'IdActiMant', fallback: '' },
        { key: 'CodiActi', fallback: '' },
        { key: 'NombActi', fallback: '' },
        { key: 'Descri', fallback: '' },
      ]),
      `<Row></Row>`,
      `<Row><Cell ss:StyleID="section"><Data ss:Type="String">Causas de mantenimiento</Data></Cell></Row>`,
      `<Row>
        <Cell ss:StyleID="header"><Data ss:Type="String">ID Causa</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Código</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Nombre</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Descripción</Data></Cell>
      </Row>`,
      this.buildSimpleTableRows(causas, [
        { key: 'IdCausMant', fallback: '' },
        { key: 'CodiCaus', fallback: '' },
        { key: 'NombCaus', fallback: '' },
        { key: 'Descri', fallback: '' },
      ]),
      `<Row></Row>`,
      `<Row><Cell ss:StyleID="link" ss:HRef="#Indice Ordenes!A1"><Data ss:Type="String">Volver al índice</Data></Cell></Row>`,
    ].join('');

    return `<Worksheet ss:Name="${this.escapeXml(sheetName)}"><Table>${headerRows}</Table></Worksheet>`;
  }

  private buildLabelValueRow(label: string, value: unknown): string {
    return `<Row>
      <Cell ss:StyleID="label"><Data ss:Type="String">${this.escapeXml(label)}</Data></Cell>
      <Cell><Data ss:Type="String">${this.escapeXml(String(value ?? ''))}</Data></Cell>
    </Row>`;
  }

  private buildSimpleTableRows(items: any[], columns: Array<{ key: string; fallback: string }>): string {
    if (items.length === 0) {
      return `<Row><Cell><Data ss:Type="String">Sin registros</Data></Cell></Row>`;
    }

    return items.map((item) => {
      const cells = columns
        .map((column) => `<Cell><Data ss:Type="String">${this.escapeXml(String(item?.[column.key] ?? column.fallback))}</Data></Cell>`)
        .join('');

      return `<Row>${cells}</Row>`;
    }).join('');
  }

  private createUniqueSheetName(baseName: string): string {
    const sanitizedBase = (baseName || 'Orden')
      .replace(/[\\\/\?\*\[\]:]/g, ' ')
      .trim()
      .slice(0, 31) || 'Orden';

    let candidate = sanitizedBase;
    let counter = 1;

    while (this.sheetNameRegistry.has(candidate)) {
      const suffix = ` ${counter}`;
      candidate = `${sanitizedBase.slice(0, Math.max(0, 31 - suffix.length))}${suffix}`;
      counter += 1;
    }

    this.sheetNameRegistry.add(candidate);
    return candidate;
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

import { Component, ChangeDetectorRef } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})
export class SidebarComponent {

  constructor(
    public sidebarService: SidebarService,
    private cdr: ChangeDetectorRef
  ) {}

  // look for changes
  ngDoCheck() {
    this.cdr.detectChanges();
  }
}
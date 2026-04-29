import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MarkdownComponent } from 'ngx-markdown';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, FormsModule, MarkdownComponent],
})
export class SidebarComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chatOpen = false;
  userInput = '';
  loading = false;
  sessionId = crypto.randomUUID();
  messages: Message[] = [
    { role: 'bot', content: 'Hola, soy el asistente de SizeSoft. ¿En qué te puedo ayudar?' }
  ];

  constructor(
    public sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngDoCheck() {
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }

  sendMessage() {
    const msg = this.userInput.trim();
    if (!msg || this.loading) return;

    this.messages.push({ role: 'user', content: msg });
    this.userInput = '';
    this.loading = true;

    this.http.post<{ response: string, session_id: string }>(
      'http://localhost:8000/chat',
      { message: msg, session_id: this.sessionId }
    ).subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', content: res.response });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', content: 'Error al conectar con el asistente. Intenta de nuevo.' });
        this.loading = false;
      }
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
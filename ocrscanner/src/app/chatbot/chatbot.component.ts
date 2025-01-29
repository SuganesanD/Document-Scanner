import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [HttpClientModule,FormsModule,CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  userPrompt: string = '';
  streamedOutput: string = '';
  constructor(private http: HttpClient) {}

  generateResponse() {
    this.streamedOutput = '';
    const serverUrl = 'http://localhost:3001/query';  
    const payload = { prompt: this.userPrompt };

    this.http.post(serverUrl, payload, { responseType: 'text' }).subscribe(
      (data: string) => {
        console.log('Received data:', data);
        this.streamedOutput += data;
      },
      (error) => {
        console.error('Error fetching response:', error);
        alert('Failed to fetch data from server.');
      }
    );
  }


}

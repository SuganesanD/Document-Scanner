import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  providers:[SharedService],
  imports: [HttpClientModule,FormsModule,CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  userMessage: string = '';  // Model for user input
  messages: { sender: string, ai: string }[] = [];  // Array to store messages
  chattext:string=''
  
  // Send message function
  
  userPrompt: string = '';
  
  streamedOutput: string = '';
  
  
  constructor(private http: HttpClient,private shared:SharedService) { }
  
  ngOnInit(){
    console.log(`inside the chatbot ${this.chattext}`);
  }

  generateResponse() {

    const serverUrl = 'http://localhost:3001/query';
    const payload = { prompt: this.userPrompt };

    this.http.post(serverUrl, payload, { responseType: 'text' }).subscribe(
      (data: string) => {
        console.log('Received data:', data);
        this.streamedOutput = data;
        console.log(this.streamedOutput);
        this.messages.push({ sender: payload.prompt, ai: this.streamedOutput });
        console.log("messages: ",this.messages);
        

      },
      (error) => {
        console.error('Error fetching response:', error);
        alert('Failed to fetch data from server.');
      }
    );

    this.userPrompt = '';
  }

}

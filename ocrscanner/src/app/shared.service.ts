import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  extractedTexts: string =  ''; // Store all extracted texts
  private ocrTextSubject = new BehaviorSubject<string>('');
  ocrText = this.ocrTextSubject.asObservable();

  updateOcrText(text: string) {
    console.log(`inside service${text}`);
    
    this.extractedTexts=text;
    console.log(this.extractedTexts);
    
    // this.ocrTextSubject.next(this.extractedTexts.join('\n\n')); // Send combined text
  }

  clearExtractedTexts() {
    
    this.ocrTextSubject.next('');
  }
  

  setOcrText(text: string) {
    this.extractedTexts = text
    
    this.ocrTextSubject.next(text);
  }
}

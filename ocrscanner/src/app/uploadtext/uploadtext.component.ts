import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import Cropper from 'cropperjs';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DocumentdbService } from '../documentdb.service';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-uploadtext',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './uploadtext.component.html',
  styleUrls: ['./uploadtext.component.css']
})
export class UploadtextComponent {
  @ViewChild('imageElement', { static: false }) imageElement!: ElementRef;
  cropper!: Cropper;
  imageUrl: string = "";
  croppedImages: string[] = [];
  selectedContents: string[] = [];
  fileContent: string = '';
  summarizedContent: string = '';
  selectedFormat: string = 'txt';
  selectedSummaryLevel: string = '';
  documentid: string = '';
  userid: string = "user_000_9876543456";
  selectedItems: boolean[] = [];

  constructor(private http: HttpClient, private couch: DocumentdbService) {}


  
    @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef;
    ctx!: CanvasRenderingContext2D;
  
    image!: HTMLImageElement;
    selectionActive = false;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
  
    onFileChange(event: any) {
      const file = event.target.files[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = reader.result as string;
        setTimeout(() => this.loadImage(), 100);
      };
      reader.readAsDataURL(file);
    }
    // onFileChange(event: any) {
    //   const file = event.target.files[0];
    //   if (!file) return;
  
    //   if (file.type.startsWith('image/')) {
    //     this.fileContent = '';
    //     this.previewImage(file);
    //   } else if (file.type === 'text/plain') {
    //     this.readTextFile(file);
    //     this.imageUrl = null;
    //   } else if (file.type === 'application/msword' || 
    //              file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    //     this.imageUrl = null;
    //     this.readDocxFile(file);
    //   } else {
    //     alert('Unsupported file type. Please upload a text, doc, or image file.');
    //   }
    // }
  
    loadImage() {
      const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
      this.ctx = canvas.getContext('2d')!;
      
      this.image = new Image();
      this.image.src = this.imageUrl!;
      this.image.onload = () => {
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        this.ctx.drawImage(this.image, 0, 0);
      };
    }
  
    startSelection(event: MouseEvent) {
      this.selectionActive = true;
      this.startX = event.offsetX;
      this.startY = event.offsetY;
    }
  
    updateSelection(event: MouseEvent) {
      if (!this.selectionActive) return;
  
      const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
      this.ctx.drawImage(this.image, 0, 0);
      this.endX = event.offsetX;
      this.endY = event.offsetY;
  
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
    }
  
    endSelection(event: MouseEvent) {
      this.selectionActive = false;
    }
  
  generateuuid() {
    this.documentid = `document_2_${uuidv4()}`;
  }

  
  previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      setTimeout(() => {
        this.initCropper();
      }, 100);
    };
    reader.readAsDataURL(file);
  }

  initCropper() {
    if (this.imageElement && this.imageElement.nativeElement) {
      this.cropper = new Cropper(this.imageElement.nativeElement, {
        aspectRatio: 0,
        viewMode: 1,
        scalable: true,
        zoomable: true,
        autoCropArea: 1,
      });
    }
  }

  cropImage() {
    const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
      const width = this.endX - this.startX;
      const height = this.endY - this.startY;
      
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = width;
      croppedCanvas.height = height;
  
      const croppedCtx = croppedCanvas.getContext('2d')!;
      croppedCtx.drawImage(canvas, this.startX, this.startY, width, height, 0, 0, width, height);
  
      this.imageUrl = croppedCanvas.toDataURL('image/png'); // Update preview with cropped image
      this.extractTextFromImage(this.imageUrl)
  }

  extractTextFromImage(imageurl: string) {
    Tesseract.recognize(imageurl, 'eng')
      .then(({ data: { text } }) => {
        this.selectedContents.push(text);
      })
      .catch((error) => console.error('OCR Error:', error));
  }

  addSelectedContent() {
    this.croppedImages.forEach(image => this.extractTextFromImage(image));
  }

  readTextFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileContent = e.target.result;
    };
    reader.readAsText(file);
  }

  readDocxFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      mammoth.convertToHtml({ arrayBuffer: e.target.result })
        .then((result) => {
          this.fileContent = result.value.replace(/<p[^>]*>/g, '').replace(/<p>/g, '<br/>');
        })
        .catch((err) => console.error('Error converting DOCX:', err));
    };
    reader.readAsArrayBuffer(file);
  }

  sendToChatbot() {
    if (!this.selectedSummaryLevel || this.selectedContents.length === 0) {
      alert("Please select a summary level and ensure content is selected!");
      return;
    }
  
    // Combine selected contents into a single text block
    const textToSummarize = this.selectedContents.join("\n");
  
    // Format the chatbot query correctly
    const summaryPrompt = `Give me ${this.selectedSummaryLevel} paragraph on ${textToSummarize}`;
    console.log(summaryPrompt);
    
  
    // Send the request to the chatbot API
    this.http.post<{ response: string }>("http://localhost:3001/generate-summary", {
      model: "qwen2.5.0.5b", // Change if using a different model in Ollama
      prompt: summaryPrompt,
      stream: false
    }).subscribe({
      next: (response) => {
        if (response && response.response) {
          this.summarizedContent = response.response; // ✅ Store the chatbot response
          console.log("Summarized Content:", this.summarizedContent);
          console.log(this.summarizeContent.length);
          
        } else {
          console.error("Invalid response format:", response);
        }
      },
      error: (error) => {
        console.error("Error fetching summary:", error);
      }
    });
  }


  removeSelectedContent(index: number) {
    this.selectedContents.splice(index, 1);
    this.selectedItems.splice(index, 1);
  }

  isAnyContentSelected(): boolean {
    return this.selectedContents.length > 0;
  }

  summarizeContent() {
    if (this.selectedSummaryLevel) {
      this.summarizedContent = `Summarized to ${this.selectedSummaryLevel}: ` + this.selectedContents.join(' ');
    }
  }
  download() {
    const selectedText = this.selectedContents.filter((_, index) => this.selectedItems[index]);
    
    if (selectedText.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    let content = selectedText.join('\n'); // Combine selected items

    if (this.selectedFormat === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, 'selected-content.txt');
    } else if (this.selectedFormat === 'doc') {
      const blob = new Blob([content], { type: 'application/msword' });
      saveAs(blob, 'selected-content.doc');
    } 
  }

  downloadsummarized() {
    const selectedText = this.selectedContents.filter((_, index) => this.selectedItems[index]);
    
    if (selectedText.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    let content = selectedText.join('\n'); // Combine selected items

    if (this.selectedFormat === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, 'selected-content.txt');
    } else if (this.selectedFormat === 'doc') {
      const blob = new Blob([content], { type: 'application/msword' });
      saveAs(blob, 'selected-content.doc');
    } 
  }
  addToCouch(data:any):void {
    console.log("inside the add to couch");
   
    if (!this.fileContent) {
      alert("Please upload a file before saving to CouchDB.");
      return;
    }   
    console.log(data);
      
    // Save to CouchDB using the service
    this.couch.add_document(data).subscribe({
      next: (response) => {
        console.log("Document added to CouchDB:", response);
        alert("Document successfully added to CouchDB!");
      },
      error: (error) => {
        console.error("Error adding document to CouchDB:", error);
        alert("Failed to save document. Check console for details.");
      }
    });
  }


}
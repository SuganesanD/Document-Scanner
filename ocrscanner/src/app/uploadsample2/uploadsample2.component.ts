  
import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import mammoth from 'mammoth';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DocumentdbService } from '../documentdb.service';
import { PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-uploadsample2',
  standalone: true,
  imports: [CommonModule,FormsModule,HttpClientModule,PdfViewerModule],
  templateUrl: './uploadsample2.component.html',
  styleUrl: './uploadsample2.component.css'
})
export class Uploadsample2Component {
  @ViewChild('cropCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  selectedText: string = '';
  summarizedContent: string = '';
  selectedContents: string[] = [];
  selectedItems: boolean[] = [];
  currentPage: number = 1;
  textChunks: string[] = [];
  selectedFormat: string = 'txt';
  selectedSummaryLevel: string = '';

  documentid:string=''
  userid:string='user_000'
  document_name:string=''
  document_type:string=''

  
  // Process image
  cropCanvas: HTMLCanvasElement;
  imageSrc: string='';
  @ViewChild('cropCanvas', { static: false }) Canvas!: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D | null = null;


  fileContent: string = '';
  
  pageSize: number = 20; // 20 lines per page
  imageUrl: string='';
  

  
  constructor(private http: HttpClient,private documentViewerService: DocumentdbService) {
    this.cropCanvas = document.createElement('canvas');
  }

  generateuuid(){
    this.documentid=`document_2_"${uuidv4()}"`;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      if (file.type.startsWith('image')) {
        this.handleImageUpload(file);
      // } else if (file.type === 'application/pdf') {
      //   this.handlePdfUpload(file);
      this.document_name=file.name;
      this.document_type=file.type
      
      
      } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.readDocxFile(file);
      } else if (file.type === 'text/plain') {
        this.readTextFile(file);
      } else {
        alert('Invalid file format!');
      }
    }
  }
 

  // Read and parse text files
  readTextFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileContent = e.target.result;
      this.paginateText(); // Paginate text file content
    };
    reader.readAsText(file);
  }

  // Read and parse DOCX files
  readDocxFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      mammoth.convertToHtml({ arrayBuffer: e.target.result })
        .then((result) => {
          // Extract the text from the HTML result
          let docContent = result.value;

          // Handle paragraphs in DOCX and preserve line breaks
          docContent = docContent.replace(/<\/p>/g, '<br/>'); // Replace end of paragraphs with line breaks
          docContent = docContent.replace(/<p[^>]*>/g, ''); // Remove opening <p> tags

          // Ensure we're displaying the content in a paginated manner
          this.fileContent = docContent;
          this.currentPage=1
          this.paginateText(); // Paginate DOCX content
        })
        .catch((err) => console.error('Error converting DOCX:', err));
    };
    reader.readAsArrayBuffer(file);
  }

  // Paginate the text content (both text and DOCX files)
  paginateText() {
    let allLines: string[] = [];

    // If the file is text, split it by new line characters (\n or \r\n)
    if (this.fileContent.includes('<br/>')) {
      // DOCX content (with <br/> line breaks)
      allLines = this.fileContent.split('<br/>');
    } else {
      // Text file content (split by actual line breaks)
      allLines = this.fileContent.split(/\r\n|\n/);
    }

    let chunk = '';
    this.textChunks = []; // Clear previous chunks
    this.currentPage=1

    allLines.forEach((line, index) => {
      chunk += line + '<br/>';

      // If chunk reaches max page size (20 lines), push it and start a new chunk
      if ((index + 1) % this.pageSize === 0 || index === allLines.length - 1) {
        this.textChunks.push(chunk);
        chunk = ''; // Reset chunk
      }
    });
  }

  // Go to the next page
  nextPage() {
    if (this.currentPage < this.textChunks.length) {
      this.currentPage++;
    }
  }

  // Go to the previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Handle text selection
  onTextSelect() {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      this.selectedText = selection.toString();
    }
  }

  // Add the selected content to the list of added contents
  addSelectedContent() {
    if (this.selectedText && !this.selectedContents.includes(this.selectedText)) {
      this.selectedContents.push(this.selectedText);
      this.selectedText = ''; // Reset selected text after adding it
    }
  }

  // Reset the selection (if needed for UX improvements)
  resetSelection() {
    this.selectedText = '';
  }

  removeSelectedContent(index: number) {
    this.selectedContents.splice(index, 1);
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
    } else if (this.selectedFormat === 'pdf') {
      this.generatePDF(content);
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
    } else if (this.selectedFormat === 'pdf') {
      this.generatePDF(content);
    }
  }


  generatePDF(content: string) {
    import('jspdf').then(jsPDF => {
      const doc = new jsPDF.default();
      
      doc.text(content, 10, 10);
      doc.save('selected-content.pdf');
    });
  }

  summarizeContent() {
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
  isAnyContentSelected(): boolean {
    return this.selectedItems.some(item => item); // Returns true if any checkbox is checked
  }
  
  
  cropping: boolean = false;
  startX: number = 0;
  startY: number = 0;
  width: number = 0;
  height: number = 0;


  croppedImageSrc: string = ''; // For the cropped image

  img: HTMLImageElement = new Image();
  
 

  ngAfterViewInit() {
    this.initializeCanvas();
  }

  initializeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  

  handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.img.onload = () => {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = this.img.width;
        canvas.height = this.img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(this.img, 0, 0);
        }
        this.imageSrc = canvas.toDataURL();
      };
      this.imageSrc = e.target.result;
      this.loadImageOnCanvas();
    };
    reader.readAsDataURL(file);
  }

  loadImageOnCanvas() {
    if (!this.imageSrc || !this.cropCanvas) return;

    this.img = new Image();
    this.img.src = this.imageSrc;

    this.img.onload = () => {
      const canvas = this.Canvas.nativeElement; // ✅ Correct usage
      this.ctx = canvas.getContext('2d');

      if (!this.ctx) return;

      // Resize canvas to match image
      canvas.width = this.img.width;
      canvas.height = this.img.height;

      // Draw the image onto the canvas
      this.ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
    };
  }

  startCropping(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const canvasRect = canvas.getBoundingClientRect();
    this.startX = event.clientX - canvasRect.left;
    this.startY = event.clientY - canvasRect.top;
    this.cropping = true;
  }

  drawCropArea(event: MouseEvent) {
    if (!this.cropping) return;

    const canvas = this.canvasRef.nativeElement;
    const canvasRect = canvas.getBoundingClientRect();
    this.width = event.clientX - canvasRect.left - this.startX;
    this.height = event.clientY - canvasRect.top - this.startY;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.img, 0, 0);
      ctx.beginPath();
      ctx.rect(this.startX, this.startY, this.width, this.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  finishCropping() {
    if (!this.cropping) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCanvas.width = this.width;
      croppedCanvas.height = this.height;

      if (croppedCtx) {
        croppedCtx.drawImage(canvas, this.startX, this.startY, this.width, this.height, 0, 0, this.width, this.height);
        this.croppedImageSrc = croppedCanvas.toDataURL();
        this.imageUrl = croppedCanvas.toDataURL('image/png'); // Update preview with cropped image
      this.extractTextFromImage(this.croppedImageSrc)
        
      }
    }

    this.cropping = false;
  }

  extractTextFromImage(imageurl: string) {
    Tesseract.recognize(imageurl, 'eng')
      .then(({ data: { text } }) => {
        this.selectedContents.push(text);
      })
      .catch((error) => console.error('OCR Error:', error));
  }


  resetCrop() {
    this.cropping = false;
    this.croppedImageSrc = '';
    this.imageSrc = '';
    this.initializeCanvas();
  }



  addtocouch(){
    const document_data={
      _id: this.documentid,  // Unique identifier for the document           // Revision number (CouchDB will manage this)
      userid: "user_id_456",    // User ID associated with the document
      uploaded_document_name: this.document_name  // Name of the uploaded document
 // The actual document content (Base64 encoded)
      summarized_document_name: "summarized_document.txt",  // Name of the summarized document
      summarized_document_content: "Summarized text content of the document",  // Summarized document content
      _attachments: {
        uploaded_document: {
          content_type: this.document_type,  // MIME type of the attachment
          data: "Base64 encoded document content"  // Base64 encoded attachment content
        }
      }
    

    }
  }


}



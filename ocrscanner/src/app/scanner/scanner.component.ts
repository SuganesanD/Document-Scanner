
import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import jsPDF from 'jspdf';
import * as docx from 'docx';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as Tesseract from 'tesseract.js'
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [SharedService],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css'
})
export class ScannerComponent {

  title = '';
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  extractedText: string = '';
  imageSrc: string = '';
  pdfSrc: string | undefined = undefined;
  txtPreview: string = '';
  wordPreview: string = '';
  pdfPages: string[] = [];
  currentPages: number = 0;
  textPages: string[] = []


  constructor(private sharedService: SharedService, private router: Router) { }



  onFileChange(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const fileType = file.type;

      // Check for image file type
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageSrc = e.target?.result as string; // Set image preview
        };
        reader.readAsDataURL(file);

        // Optionally, process the image with OCR
        this.preprocessImage(file).then((processedCanvas: any) => {
          this.extractTextFromImage(processedCanvas);
        });
      }

      // Check for PDF file type
      else if (fileType === 'application/pdf') {
        this.previewPDF(file);
        this.extractTextFromPDF(file);
      }

      // Check for Word file type
      else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.previewWord(file);
        this.extractTextFromWord(file);
      }

      // Check for .txt file type
      else if (fileType === 'text/plain') {
        this.previewTextFile(file);
        this.extractTextFromTextFile(file);
      }
    }
  }

  // Preview PDF file
  previewPDF(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as ArrayBuffer;
      const pdfData = new Uint8Array(fileData);

      // Create a Blob URL to display the PDF
      this.pdfSrc = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
    };
    reader.readAsArrayBuffer(file);
  }

  // Preview Word file
  previewWord(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      mammoth.extractRawText({ arrayBuffer })
        .then((result) => {
          this.wordPreview = result.value;
        })
        .catch((error) => {
          console.error('Error extracting Word text:', error);
        });
    };
    reader.readAsArrayBuffer(file);
  }

  // Preview .txt file
  previewTextFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.txtPreview = reader.result as string;
    };
    reader.readAsText(file);
  }
  splitTextIntoPages(text: string): string[] {
    const PAGE_SIZE = 1500; // Define how many characters fit into a "page"
    const pages: string[] = [];
    for (let i = 0; i < text.length; i += PAGE_SIZE) {
      pages.push(text.substring(i, i + PAGE_SIZE));
    }
    return pages;
  }


  // Extract text from PDF with multiple pages
  extractTextFromPDF(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const pdfData = new Uint8Array(reader.result as ArrayBuffer);
      pdfjsLib.getDocument(pdfData).promise.then((pdf) => {
        let pagePromises = [];
        this.pdfPages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          pagePromises.push(
            pdf.getPage(i).then((page) =>
              page.getTextContent().then((content) => {
                let pageText = '';
                content.items.forEach((item: any) => {
                  pageText += item.str + ' ';
                });
                this.pdfPages[i - 1] = pageText;
              })
            )
          );
        }

        Promise.all(pagePromises).then(() => {
          const combinedText = this.pdfPages.join('\n\n'); // Combine all pages
          this.extractedText = combinedText;
        });
      });
    };
    reader.readAsArrayBuffer(file);
  }
  nextPage(): void {
    if (this.currentPages < this.getTotalPages() - 1) {
      this.currentPages++;
      this.extractedText = this.getCurrentPageText();
    }
  }

  // Previous Page for any document
  prevPage(): void {
    if (this.currentPages > 0) {
      this.currentPages--;
      this.extractedText = this.getCurrentPageText();
    }
  }

  // Get the total number of pages depending on the document type
  getTotalPages(): number {
    if (this.pdfPages.length > 0) {
      return this.pdfPages.length;
    } else if (this.textPages.length > 0) {
      return this.textPages.length;
    } else {
      return 0;
    }
  }

  // Get the current page text depending on the document type


  // Extract text from Word
  extractTextFromWord(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = reader.result as ArrayBuffer;
      mammoth.extractRawText({ arrayBuffer })
        .then((result) => {
          this.extractedText = result.value;
          this.sharedService.updateOcrText(result.value);
        })
        .catch((error) => {
          console.error('Error extracting Word text:', error);
        });
    };
    reader.readAsArrayBuffer(file);
  }

  // Extract text from .txt file
  extractTextFromTextFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.extractedText = reader.result as string;
      this.sharedService.updateOcrText(this.extractedText);
    };
    reader.readAsText(file);
  }
  sendToChatbot() {

    this.sharedService.setOcrText(this.extractedText);
    this.router.navigate(['/chatbot']);
  }



  // Get the current page text depending on the document type
  getCurrentPageText(): string {
    if (this.pdfPages.length > 0) {
      return this.pdfPages[this.currentPages];
    } else if (this.textPages.length > 0) {
      return this.textPages[this.currentPages];
    } else {
      return '';
    }
  }


  // Download extracted text as PDF
  downloadPDF(): void {
    const doc = new jsPDF();
    const text = this.extractedText || ''; // Extracted text from your input
    const lines = text.split('\n'); // Split text into lines based on line breaks

    let yPosition = 10; // Starting position for text in PDF
    const lineHeight = 6; // Reduced line height (you can adjust this value)
    const pageHeight = doc.internal.pageSize.height; // Get page height
    const margin = 10; // Set margins for the page

    lines.forEach((line, index) => {
      if (yPosition + lineHeight > pageHeight - margin) {
        // If the current yPosition exceeds the page height, create a new page
        doc.addPage();
        yPosition = margin; // Reset yPosition to start at the top of the new page
      }
      doc.text(line, margin, yPosition); // Add each line to the PDF
      yPosition += lineHeight; // Increment Y position to avoid overlapping
    });

    doc.save('extractedText.pdf'); // Save the PDF file
  }



  // Download extracted text as Word
  downloadWord(): void {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: this.extractedText
            .split('\n') // Split text into lines
            .map((line) =>
              new docx.Paragraph({
                text: line,
                spacing: { after: 0, line: 240 }, // Add spacing between lines
              })
            ),
        },
      ],
    });

    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'extractedText.docx');
    });
  }


  // Download extracted text as TXT
  downloadText(): void {
    const text = this.extractedText || ''; // Extracted text
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'extractedText.txt'); // Save the text file
  }

  preprocessImage(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // Create a canvas to manipulate the image
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;

          // Set the canvas size to match the image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image on the canvas
          context.drawImage(img, 0, 0, img.width, img.height);

          // Apply grayscale filter to improve OCR accuracy
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray; // Set red, green, and blue channels to grayscale
          }

          context.putImageData(imageData, 0, 0);

          // Return the processed canvas
          resolve(canvas);
        };

        img.onerror = reject; // Handle image load errors
      };

      reader.onerror = reject; // Handle file read errors
      reader.readAsDataURL(file); // Read the image file
    });
  }

  // Extract text from the preprocessed image using Tesseract.js
  extractTextFromImage(canvas: HTMLCanvasElement): void {
    Tesseract.recognize(
      canvas,               // The image in canvas format
      'eng',                 // Language to recognize (English in this case)
      {
        logger: (m) => console.log(m) // Log progress of OCR
      }
    ).then(({ data: { text } }) => {
      this.extractedText = text;
      console.log(this.extractedText);
      this.sharedService.updateOcrText(this.extractedText)

      // Update the extracted text
    }).catch((error) => {
      console.error('Error extracting text from image:', error);
    });
  }



}
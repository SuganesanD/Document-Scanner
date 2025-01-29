import { Component,ElementRef,NgModule,ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import jsPDF from 'jspdf';
import * as docx from 'docx';
import { saveAs } from 'file-saver';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as Tesseract from 'tesseract.js'
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.css'
})
export class ScannerComponent {
 
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  extractedText: string = '';
  imageSrc: string = '';

  // Preprocess the image: Convert to grayscale, resize...
  preprocessImage(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // Create a canvas 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0,1000,1000);

          // Apply preprocessing: Convert to grayscale
          const imageData = context.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = gray;
          }

          // Put the processed image data back to the canvas
          context.putImageData(imageData, 0, 0);
          resolve(canvas);
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  extractTextFromImage(canvas: HTMLCanvasElement): void {
    Tesseract.recognize(
      canvas,
      'eng', // Language code
      {
        logger: (m) => console.log(m), // Optional: logger to show progress
      }
    ).then(({ data: { text } }) => {
      this.extractedText = text;
      console.log('Extracted Text:', text);
    }).catch((error) => {
      console.error('Error extracting text: ', error);
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.preprocessImage(file).then((processedCanvas) => {
        this.imageSrc = processedCanvas.toDataURL(); // To display image in HTML
        this.extractTextFromImage(processedCanvas);
      });
    }
   
    if (file) {
      const fileType = file.type;

      // Check for PDF file type
      if (fileType === 'application/pdf') {
        this.extractTextFromPDF(file);
      } 
      // Check for Word file type
      else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.extractTextFromWord(file);
      } 
      // Check for .txt file type
      else if (fileType === 'text/plain') {
        this.extractTextFromTextFile(file);
      }
      // Handle other file types like image here
    }
  }
extractTextFromPDF(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const pdfData = new Uint8Array(reader.result as ArrayBuffer);

      pdfjsLib.getDocument(pdfData).promise.then((pdf) => {
        const numPages = pdf.numPages;
        let text = '';
        let pagePromises = [];

        for (let i = 1; i <= numPages; i++) {
          pagePromises.push(
            pdf.getPage(i).then((page) => {
              return page.getTextContent().then((content) => {
                content.items.forEach((item: any) => {
                  text += item.str + ' ';
                });
              });
            })
          );
        }

        Promise.all(pagePromises).then(() => {
          this.extractedText = text;
          console.log('Extracted PDF Text:', this.extractedText);
        });
      });
    };
    reader.readAsArrayBuffer(file);
  }

  extractTextFromWord(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = reader.result as ArrayBuffer;
      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then((result) => {
          this.extractedText = result.value;
          console.log('Extracted Word Text:', this.extractedText);
        })
        .catch((error) => {
          console.error('Error extracting Word text:', error);
        });
    };
    reader.readAsArrayBuffer(file);
  }
  extractTextFromTextFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.extractedText = reader.result as string;
      console.log('Extracted Text from .txt:', this.extractedText);
    };
    reader.readAsText(file);
  }

  downloadPDF(): void {
    const doc = new jsPDF();
    const text = this.extractedText;

    // Ensure 'text' is not empty before proceeding
    if (!text) {
      console.error('No text to generate PDF');
      return;
    }

    // Split the text into lines, with an optional custom max width
    const lines: string[] = doc.splitTextToSize(text, 180);  // Adjust max width as needed

    let yPosition = 10;

    // Loop through each line and add it to the PDF document
    lines.forEach((line: string) => {
      doc.text(line, 10, yPosition);
      yPosition += 10; // Adjust line spacing as needed
    });

    // Save the generated PDF
    doc.save('extractedText.pdf');
  }


  // Download extracted text as Word file
  downloadWord(): void {
    const doc = new docx.Document({
      sections: [
        {
          properties: {},
          children: [
            new docx.Paragraph({
              text: this.extractedText,
            }),
          ],
        },
      ],
    });

    docx.Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'extractedText.docx');
    });
  }

  // Download extracted text as TXT file
  downloadText(): void {
    const blob = new Blob([this.extractedText], { type: 'text/plain' });
    saveAs(blob, 'extractedText.txt');
  }
}

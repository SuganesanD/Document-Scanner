// import { Component, ViewChild, ElementRef } from '@angular/core';
// import html2canvas from 'html2canvas';
// import Cropper from 'cropperjs';
// import Tesseract from 'tesseract.js';
// import { FormsModule } from '@angular/forms';

// import { CommonModule } from '@angular/common';
// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import * as pdfjsLib from 'pdfjs-dist'; 
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// @Component({
//   selector: 'app-uploadpdf',
//   standalone: true,
//   imports: [FormsModule,CommonModule],
//   templateUrl: './uploadpdf.component.html',
//   styleUrl: './uploadpdf.component.css'
// })
// export class UploadpdfComponent {
//   @ViewChild('pdfCanvas', { static: false }) pdfCanvas!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('croppedCanvas', { static: false }) croppedCanvas!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('pdfImage', { static: false }) pdfImage!: ElementRef<HTMLImageElement>;

//   pdfSrc: string | null = null;
//   pdfDoc: any;
//   cropper!: Cropper;
//   currentPage: number = 1;

//   async onFileSelected(event: any) {
//     const file = event.target.files[0];
//     if (file && file.type === 'application/pdf') {
//       const fileURL = URL.createObjectURL(file);
//       this.pdfSrc = fileURL;
//       this.loadPDF();
//     } else {
//       alert('Please select a valid PDF file.');
//     }
//   }

//   async loadPDF() {
//     if (!this.pdfSrc) return;

//     const loadingTask = pdfjsLib.getDocument(this.pdfSrc);
//     this.pdfDoc = await loadingTask.promise;
//     this.renderPage(this.currentPage);
//   }

//   async renderPage(pageNumber: number) {
//     if (!this.pdfDoc) return;

//     const page = await this.pdfDoc.getPage(pageNumber);
//     const viewport = page.getViewport({ scale: 2 });
//     const canvas = this.pdfCanvas.nativeElement;
//     const ctx = canvas.getContext('2d')!;

//     canvas.width = viewport.width;
//     canvas.height = viewport.height;

//     const renderContext = { canvasContext: ctx, viewport: viewport };
//     await page.render(renderContext).promise;

//     this.convertCanvasToImage();
//   }

//   convertCanvasToImage() {
//     const pdfCanvas = this.pdfCanvas.nativeElement;
//     const imageDataURL = pdfCanvas.toDataURL('image/png');

//     this.pdfImage.nativeElement.src = imageDataURL;
//     this.initializeCropper();
//   }

//   initializeCropper() {
//     if (this.cropper) {
//       this.cropper.destroy();
//     }
//     this.cropper = new Cropper(this.pdfImage.nativeElement, {
//       aspectRatio: 0, // Free selection
//       viewMode: 1
//     });
//   }

//   cropArea() {
//     if (!this.cropper) return;

//     const croppedCanvas = this.croppedCanvas.nativeElement;
//     const croppedImage = this.cropper.getCroppedCanvas();

//     croppedCanvas.width = croppedImage.width;
//     croppedCanvas.height = croppedImage.height;

//     const ctx = croppedCanvas.getContext('2d')!;
//     ctx.drawImage(croppedImage, 0, 0);
//   }

//   nextPage() {
//     if (this.currentPage < this.pdfDoc.numPages) {
//       this.currentPage++;
//       this.renderPage(this.currentPage);
//     }
//   }

//   prevPage() {
//     if (this.currentPage > 1) {
//       this.currentPage--;
//       this.renderPage(this.currentPage);
//     }
//   }
// }
  





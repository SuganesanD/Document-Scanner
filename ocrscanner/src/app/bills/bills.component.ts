import { Component } from '@angular/core';
import { DocumentdbService } from '../documentdb.service';
import FileSaver from 'file-saver';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { dateTimeValue } from 'docx';
@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [FormsModule,CommonModule,HttpClientModule],
  providers:[DocumentdbService],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent {
  document_name: string = '';
  email:string='balaji@gmail.com';
  
  
  
  selectedFile: File | null = null;
  
  getdata: any[] = [];
  selectedDocumentContent: string | null = null;
  today=new Date;

  constructor(private data: DocumentdbService,) {}

  ngOnInit(): void {
    this.getDocuments(); // Fetch data on initialization
  }

  // Handle file selection
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Add document to the database (PDF, DOCX, TXT)


  // Fetch all documents
  getDocuments(): void {
    this.data.get_document().subscribe({
      next: (response: any) => {
        if (response && response.rows) {
          console.log(response);
          this.getdata = response.rows.map((row: any, index: number) => ({
            index: index + 1,
            document_name: row.doc.fileName || 'Unknown',
            summarized_text_name:row.doc.summarizedFileName,  
            date: row.doc.uploadDate || 'N/A',
            file: row.doc.originalFileContent || null
          }
          
          
          
        ));
        console.log(this.getdata);
        } else {
          this.getdata = [];
        }
      },
      error: (error) => {
        console.error('Error fetching documents:', error);
        alert('An error occurred while fetching documents.');
      }
    });
  }
  // Retrieve and display the content
displayContent(document: any): void {
  console.log("inside the display")
  console.log(document);
  
  if (!document.file || !document.file.content) {
    this.selectedDocumentContent = 'No content available for this document.';
    return;
  }

  try {
    console.log("inside the try");
    
    const base64Content = document.split(',')[1]; // Remove the base64 prefix
    const fileType = document.file.type;

    if (fileType.startsWith('application/pdf')) {
      this.displayPDF(base64Content);
    } else if (fileType.startsWith('application/msword') || fileType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      this.displayDOCX(base64Content);
    } else if (fileType.startsWith('text/plain')) {
      this.displayTXT(base64Content);
    } else {
      this.selectedDocumentContent = 'Unsupported file type.';
    }
  } catch (error) {
    console.error('Error decoding document content:', error);
    this.selectedDocumentContent = 'Failed to decode document content.';
  }
}

// Display PDF content
private displayPDF(base64Content: string): void {
  const pdfSrc = `data:application/pdf;base64,${base64Content}`;
  const iframe = `<iframe src="${pdfSrc}" width="100%" height="500px"></iframe>`;
  this.selectedDocumentContent = iframe;
}

// Display DOCX content (this will display it as a downloadable link, for example)
private displayDOCX(base64Content: string): void {
  const byteArray = this.convertBase64ToByteArray(base64Content);
  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  this.selectedDocumentContent = `<a href="${url}" download="${document}.docx">Download DOCX</a>`;
}

// Display TXT content
private displayTXT(base64Content: string): void {
  const decodedContent = atob(base64Content); // Decode base64 content to text
  this.selectedDocumentContent = `<pre>${decodedContent}</pre>`; // Display text
}

// Helper function to convert base64 to byte array (for DOCX, PDF, etc.)
private convertBase64ToByteArray(base64Content: string): Uint8Array {
  const binaryString = atob(base64Content);
  const byteArray = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return byteArray;
}
downloadContent(document: any, format: string): void {
  if (!format) {
    alert('Please select a format before downloading.');
    return;
  }

  if (!document.file || !document.file.content) {
    alert('No content available for download.');
    return;
  }

  try {
    const base64Content = document.file.content.split(',')[1]; // Extract base64 content
    const binaryData = atob(base64Content); // Decode base64 to binary
    const byteArray = new Uint8Array(binaryData.length);

    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    let blob: Blob;
    switch (format) {
      case 'pdf':
        blob = new Blob([byteArray], { type: 'application/pdf' });
        break;
      case 'docx':
        blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        break;
      case 'txt':
        blob = new Blob([byteArray], { type: 'text/plain' });
        break;
      default:
        alert('Unsupported format.');
        return;
    }

    FileSaver.saveAs(blob, `${document.document_name}.${format}`);
  } catch (error) {
    console.error('Error processing content for download:', error);
    alert('Failed to process content for download.');
  }

}

}

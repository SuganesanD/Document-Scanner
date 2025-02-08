import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import mammoth from 'mammoth';

@Component({
  selector: 'app-uploadtext',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uploadtext.component.html',
  styleUrls: ['./uploadtext.component.css']
})
export class UploadtextComponent {
  fileContent: string = '';
  currentPage: number = 0;
  pageSize: number = 20; // 20 lines per page
  textChunks: string[] = [];
  selectedText: string = '';  // Text selected by the user
  selectedContents: string[] = [];  // Array to store all selected content

  // Handle file input changes
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Handle text files
      if (file.type === 'text/plain') {
        this.readTextFile(file);
      }
      // Handle DOCX files
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        this.readDocxFile(file);
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
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DocumentdbService } from '../documentdb.service';



@Component({
  selector: "app-uploadfile",
  templateUrl: "./uploadfile.component.html",
  standalone:true,
  providers:[DocumentdbService],
  imports:[CommonModule,FormsModule,HttpClientModule],
  styleUrls: ["./uploadfile.component.css"],
})
export class UploadfileComponent {

  constructor(private http: HttpClient,private couch:DocumentdbService) {}

  fileContent: string = '';
  currentPage: number = 0;
  pageSize: number = 20; // 20 lines per page
  textChunks: string[] = [];
  selectedText: string = '';  // Text selected by the user
  selectedContents: string[] = []; 
 
  selectedFormat: string = "pdf"; // Default format
  selectedSummaryLevel: string = ""; // Selected summarization level
  summarizedContent: string = "";// Array to store all selected content

  

 



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

 
  selectedItems: boolean[] = []; // Array to store selected checkboxes

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
  
  
    
  }

 



import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentdbService {
  private readonly baseURL = 'https://192.168.57.185:5984/logindb'; // Ensure this URL is correct
  private readonly userName = 'd_couchdb';
  private readonly password = 'Welcome#2';

  private readonly headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(`${this.userName}:${this.password}`),
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // Add a document to the database
  add_document(document_data: any): Observable<any> {
    const url = `${this.baseURL}`;
    return this.http.post<any>(url, document_data, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error in add_document:', error);
        throw error;
      })
    );
  }

  // Fetch all documents from the database
  get_document(): Observable<any> {
    const url = `${this.baseURL}/_all_docs?include_docs=true`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error) => {
        console.error('Error in get_document:', error);
        throw error;
      })
    );
  }
}

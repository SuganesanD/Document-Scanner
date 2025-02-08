import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BillsComponent } from "./bills/bills.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BillsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ocrscanner';
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LandingpageModule } from './landingpage/landingpage.module';
import { LandingPageComponent } from './landingpage/landing-page/landing-page.component';
import { HomeComponent } from "./landingpage/home/home.component";
import { ScannerComponent } from "./home/scanner/scanner.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LandingpageModule, HomeComponent, ScannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}

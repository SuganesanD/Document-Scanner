import { Routes } from '@angular/router';
import { LandingPageComponent } from './landingpage/landing-page/landing-page.component';
import { ScannerComponent } from './home/scanner/scanner.component';

export const routes: Routes = [
    {path:'',component:LandingPageComponent},
    {path:'scanner',component:ScannerComponent}
];

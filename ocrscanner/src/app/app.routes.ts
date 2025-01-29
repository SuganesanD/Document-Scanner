import { Routes } from '@angular/router';
import { ScannerComponent } from './scanner/scanner.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { HomeComponent } from './home/home.component';
import { ChatbotComponent } from './chatbot/chatbot.component';

export const routes: Routes = [
    {path:'',component:LandingpageComponent},
    {path:'scanner',component:ScannerComponent},
    {path:'home',component:HomeComponent},
    {path:'chatbot',component:ChatbotComponent}
];

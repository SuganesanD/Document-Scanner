import { Routes } from '@angular/router';
// import { ScannerComponent } from './scanner/scanner.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { HomeComponent } from './home/home.component';
import { ChatbotComponent } from './chatbot/chatbot.component';

import { BillsComponent } from './bills/bills.component';
import { UploadfileComponent } from './uploadfile/uploadfile.component';
import { UploadtextComponent } from './uploadtext/uploadtext.component';
import { UploadimageComponent } from './uploadimage/uploadimage.component';
import { LoginComponent } from './login/login.component';
// import { UploadpdfComponent } from './uploadpdf/uploadpdf.component';
import { Uploadsample2Component } from './uploadsample2/uploadsample2.component';

export const routes: Routes = [
    {path:'',component:LandingpageComponent},
    // {path:'scanner',component:ScannerComponent},
    {path:'home',component:HomeComponent},
    {path:'chatbot',component:ChatbotComponent},
    {path:'bills',component:BillsComponent},
    {path:'uploadfile',component:UploadfileComponent},
    {path:'uploadsample',component:UploadtextComponent},
    {path:'uploadimage',component:UploadimageComponent},
    {path:'login',component:LoginComponent},
    // {path:'uploadpdf',component:UploadpdfComponent},
    {path:'uploadsample2',component:Uploadsample2Component}
];

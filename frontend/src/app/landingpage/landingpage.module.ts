import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { TrialComponent } from './trial/trial.component';
import { FeaturesComponent } from './features/features.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageComponent } from './landing-page/landing-page.component';


@NgModule({
  declarations: [
    
    
  ],
  imports: [
    CommonModule,
    LandingPageComponent,
    HomeComponent,
    TrialComponent,
    FeaturesComponent,
    FooterComponent,
    NavbarComponent
    
   
  ],
  exports:[LandingPageComponent]
})
export class LandingpageModule { }

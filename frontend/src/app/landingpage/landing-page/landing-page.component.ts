import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  
  currentIndex: number = 0;  // To track the current slide
  carouselItems: any[] = [
    {
      image: 'https://via.placeholder.com/300',  // First image
      title: 'Title 1',
      content: 'This is the first content in the carousel.'
    },
    {
      image: 'https://via.placeholder.com/300',  // Second image
      title: 'Title 2',
      content: 'This is the second content in the carousel.'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Optionally, auto switch every 5 seconds
    setInterval(() => {
      this.next();
    }, 5000);
  }

  // Function to go to the previous item
  previous(): void {
    this.currentIndex = (this.currentIndex === 0) ? this.carouselItems.length - 1 : this.currentIndex - 1;
  }

  // Function to go to the next item
  next(): void {
    this.currentIndex = (this.currentIndex === this.carouselItems.length - 1) ? 0 : this.currentIndex + 1;
  }


}

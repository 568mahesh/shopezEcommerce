import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedImage: string = '';

  openImage(img: string) {
    this.selectedImage = img;
  }
  scrollToCollection() {
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  images = [
    '/assets/images/bg.png',
    '/assets/images/shoes.png',
    '/assets/images/lunchbag.png',
    '/assets/images/toys.png'
  ];
}

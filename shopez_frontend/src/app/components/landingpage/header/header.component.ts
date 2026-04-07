import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  goHome() {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => this.viewportScroller.scrollToAnchor('home'), 50);
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }

  scrollToSection(sectionId: string) {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }
}

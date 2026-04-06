import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private router: Router) {}

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}

import { Component } from '@angular/core';
import { IonicModule, ToastController, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router'
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private menu: MenuController,
    private router: Router
  ) { }

  async showToast(message: string, color: string = 'medium') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }

  login() {
    if (!this.email || !this.password) {
      this.showToast('Please enter email and password', 'danger');
      return;
    }

    this.http.post(
      'https://add2mart.shop/ionic/coffium/api/login.php',
      { email: this.email, password: this.password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe(
      (res: any) => {
        if (res.success && res.user) {
          const userId = res.user.user_id || res.user.id || 0;
          if (userId) {
            localStorage.setItem('user_id', String(userId));
            console.log('Saved user_id:', localStorage.getItem('user_id'));
          } else {
            console.error('Login response missing user_id:', res);
          }

          localStorage.setItem('first_name', res.user.first_name || '');
          localStorage.setItem('last_name', res.user.last_name || '');

          this.showToast('Login successful', 'success');
          this.router.navigateByUrl('/home');
        } else {
          this.showToast(res.message || 'Login failed', 'danger');
        }
      },
      err => {
        console.error(err);
        this.showToast('Server error', 'danger');
      }
    );
  }

}

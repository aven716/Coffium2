import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {  ToastController } from '@ionic/angular';
import { IonContent, IonInput, IonButton, IonLabel, IonItem, IonCardContent, IonCard } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, FormsModule, IonContent, IonInput, RouterModule, IonButton, IonLabel, IonItem, IonCardContent, IonCard ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  
})
export class RegisterPage {
  user = {
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  };
  apiUrl = 'https://add2mart.shop/ionic/coffium/api/register.php';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  registerUser() {
    if (!this.user.first_name || !this.user.last_name || !this.user.email || !this.user.password) {
      this.showToast('Please fill in all fields', 'danger');
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(this.apiUrl, this.user, { headers }).subscribe({
      next: async (res: any) => {
        if (res && res.message) {
          this.showToast(res.message, res.success ? 'success' : 'danger');

          if (res.success) {
            // Capture email before clearing form
            const emailForOtp = this.user.email;

            // Clear form
            this.user = { first_name: '', last_name: '', email: '', password: '' };

            // Redirect to OTP verification page with email
            this.router.navigate(['/verify-otp'], { queryParams: { email: emailForOtp } });
          }
        } else {
          this.showToast('Unexpected response from server', 'danger');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.showToast('Connection error. Please try again.', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

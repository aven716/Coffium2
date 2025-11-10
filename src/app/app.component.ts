import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {  MenuController, ToastController } from '@ionic/angular';
import { IonMenu, IonRouterOutlet, IonApp, IonContent, 
  IonItem, IonList, IonIcon, IonAvatar, IonLabel, 
  IonGrid, IonCard, IonTextarea, IonRow, 
  IonCardHeader, IonHeader, IonToolbar, IonMenuButton, IonChip } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { cart, menu, heart, star, cartOutline, searchOutline, search, 
  logOutOutline, personOutline,listOutline, 
  helpCircleOutline, informationCircleOutline, heartOutline, receiptOutline, chevronDown, chevronUp
, settingsOutline, bagOutline,homeOutline } from 'ionicons/icons';
import { h } from 'ionicons/dist/types/stencil-public-runtime';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterModule, IonMenu, IonRouterOutlet, IonApp, IonContent, 
    IonItem, IonList, IonIcon, IonAvatar, IonLabel,  IonGrid, IonCard, IonTextarea, IonRow, IonMenuButton, 
    IonCardHeader, IonHeader, IonToolbar, IonChip ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  user = {
    user_id: 0,
    first_name: '',
    last_name: '',
    email: '',
    profile_image: 'assets/images/default-profile.png'
  };

  constructor(
    private menu: MenuController,
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {
    App.addListener('appUrlOpen', (data: any) => {
      console.log('App opened with URL:', data.url);
      if (data.url.includes('coffium://home')) {
        const orderId = new URL(data.url).searchParams.get('order_id');
        if (orderId) {
          // Navigate to home/dashboard instead of order-success
          this.router.navigate(['/home'], { state: { orderId } });
          this.showToast('Payment successful!', 'success');
        }
      }
    });

   }

  ngOnInit() {
    // Register icons
    addIcons({
      cart, menu, heart, star, cartOutline, searchOutline, search, logOutOutline, personOutline,
      listOutline, helpCircleOutline, informationCircleOutline, heartOutline, receiptOutline,
      chevronDown, chevronUp, settingsOutline, bagOutline, homeOutline
    });

    const userId = localStorage.getItem('user_id');

    if (userId) {
      // ✅ User is logged in — load their data silently
      this.loadUserData(userId);
    } else {
      // ✅ No user logged in — just stay on home (do NOT redirect)
      if (this.router.url === '/' || this.router.url === '/register' || this.router.url === '/login') {
        this.router.navigate(['/home']);
      }
    }
  }


  loadUserData(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`https://add2mart.shop/ionic/coffium/api/get_user.php?user_id=${userId}`)
        .subscribe(
          (res: any) => {
            if (res.success && res.user) {
              this.user = {
                user_id: res.user.user_id || res.user.id || 0,
                first_name: res.user.first_name || '',
                last_name: res.user.last_name || '',
                email: res.user.email || '',
                profile_image: res.user.profile_image
                  ? `https://add2mart.shop/ionic/coffium/api/images/profile_picture/${res.user.profile_image}`
                  : 'assets/images/default-profile.png'
              };
            } else {
              console.warn('User data not found:', res.message);
            }
            resolve(); // always resolve so navigation continues
          },
          err => {
            console.error('Error fetching user data:', err);
            this.showToast('Failed to load user data', 'danger');
            resolve(); // resolve anyway so navigation continues
          }
        );
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }

  logout() {
    // Clear session
    localStorage.removeItem('user_id');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');

    // Close menu first
    this.menu.close('first').then(() => {
      this.router.navigate(['/login']);
    }).catch(() => {
      // fallback
      this.router.navigate(['/login']);
    });
  }

}

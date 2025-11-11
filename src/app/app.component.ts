import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {  MenuController, ToastController } from '@ionic/angular';
import { IonMenu, IonRouterOutlet, IonApp, IonContent, 
  IonItem, IonList, IonIcon, IonAvatar, IonLabel, 
  IonGrid, IonCard, IonTextarea, IonRow, 
  IonCardHeader, IonHeader, IonToolbar, IonMenuButton, IonChip } from '@ionic/angular/standalone';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { cart, menu, heart, star, cartOutline, searchOutline, search, 
  logOutOutline, personOutline,listOutline, 
  helpCircleOutline, informationCircleOutline, heartOutline, receiptOutline, chevronDown, chevronUp
, settingsOutline, bagOutline,homeOutline } from 'ionicons/icons';
import { h } from 'ionicons/dist/types/stencil-public-runtime';
import { App } from '@capacitor/app';
import { ChangeDetectorRef } from '@angular/core';
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
  apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';
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
    private toastCtrl: ToastController,
     private cdr: ChangeDetectorRef // ✅ add this
  ) {
    App.addListener('appUrlOpen', async (data: any) => {
      console.log('App opened with URL:', data.url);

      if (data.url.includes('coffium://home')) {
        const orderId = new URL(data.url).searchParams.get('order_id');
        if (orderId) {
          try {
            const res: any = await this.http
              .get(`${this.apiBaseUrl}get_order.php?order_id=${orderId}`)
              .toPromise();

            if (res.success && res.order) {
              // Navigate with route param
              this.router.navigate(['/order', orderId], { state: { order: res.order } });
            } else {
              console.error('Failed to fetch order:', res.message);
              // fallback: still navigate to route with ID
              this.router.navigate(['/order', orderId]);
            }
          } catch (err) {
            console.error('Error fetching order:', err);
            // fallback: navigate anyway
            this.router.navigate(['/order', orderId]);
          }
        }

      }
    });

   }
  isLoggedIn: boolean = false; // ✅ default false

  ngOnInit() {
    addIcons({
      cart, menu, heart, star, cartOutline, searchOutline, search, logOutOutline, personOutline,
      listOutline, helpCircleOutline, informationCircleOutline, heartOutline, receiptOutline,
      chevronDown, chevronUp, settingsOutline, bagOutline, homeOutline
    });

    const userId = localStorage.getItem('user_id');

    if (userId) {
      this.loadUserData(userId);
    } else {
      this.isLoggedIn = false; // ✅ make sure it’s set before render
      if (this.router.url === '/' || this.router.url === '/register' || this.router.url === '/login') {
        this.router.navigate(['/home']);
      }
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url.includes('/login') || url.includes('/register')) {
          this.menu.enable(false, 'first');
        } else {
          this.menu.enable(true, 'first');
        }
      }
    });
  }

  loadUserData(userId: string): Promise<void> {
    return new Promise((resolve) => {
      this.http.get(`${this.apiBaseUrl}get_user.php?user_id=${userId}`)
        .subscribe((res: any) => {
          if (res.success && res.user) {
            this.user = {
              user_id: res.user.user_id || 0,
              first_name: res.user.first_name || '',
              last_name: res.user.last_name || '',
              email: res.user.email || '',
              profile_image: res.user.profile_image
                ? `https://add2mart.shop/ionic/coffium/api/images/profile_picture/${res.user.profile_image}`
                : 'assets/images/default-profile.png'
            };
            this.isLoggedIn = true;
          } else {
            this.isLoggedIn = false;
          }

          this.cdr.detectChanges(); // ✅ Force Angular to re-render immediately
          resolve();
        }, err => {
          console.error(err);
          this.isLoggedIn = false;
          this.cdr.detectChanges(); // ✅ Still update view
          resolve();
        });
    });
  }


  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }

  closeMenu() {
    this.menu.close('first'); // closes menu with id 'first'
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

  doRefresh(event: any) {
    console.log('Refreshing...');
    this.loadUserData(localStorage.getItem('user_id') || '');
  
    setTimeout(() => {
      event.target.complete(); // stops the spinner
    }, 1000); // you can adjust timing
  }

  refreshMenu() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.loadUserData(userId)
        .then(() => console.log('Menu refreshed'))
        .catch(err => console.error('Failed to refresh menu', err));
    }
  }
}

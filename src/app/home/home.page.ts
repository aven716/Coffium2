import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

// ✅ Ionic Standalone Components
import {
  IonItem,
  IonAvatar,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  ToastController,
  IonToast
} from '@ionic/angular/standalone';

// ✅ Other imports
import {  MenuController } from '@ionic/angular';
import { AppHeaderComponent } from '../shared/app-header/app-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    // Angular & Router
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,

    // ✅ Ionic Components
    IonItem,
    IonAvatar,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonToast,

    // ✅ Shared Component
    AppHeaderComponent
  ],
})
export class HomePage {
  // Initialize user safely
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string;
    address: string;
  } = {
      user_id: 0,
      first_name: '',
      last_name: '',
      email: '',
      profile_image: '',
      address: ''
    };

  searchQuery: string = '';
  selectedOption: string = 'pickup';
  selectedCategoryId: number | null = null;
  
  categories: { category_id: number; category_name: string }[] = [];

  topProducts: any[] = [];
  suggestedProducts: any[] = [];
  allTopProducts: any[] = [];
  allSuggestedProducts: any[] = [];
  products: any[] = [];
  constructor(
    private menu: MenuController,
    private toastCtrl: ToastController,
    private http: HttpClient,
    private router: Router
  ) { }
  productBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/products/';


  onHeaderToggleMenu() {
    console.log('HomePage received toggleMenu event');
    this.menu.enable(true, 'first'); // make sure the menu is enabled
    this.menu.toggle('first').then(() => {
      console.log('Menu toggled from HomePage');
    });
  }


  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
 showIcons = true;

toggleMenu() {
  this.menu.enable(true, 'first');
  this.menu.toggle('first');
}


  getProductImage(filename: string) {
    return filename ? this.productBaseUrl + filename : 'assets/images/default-product.png';
  }

  posterBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/posters/';
  posters: any[] = [];

  getPosterUrl(filename: string) {
    return filename ? this.posterBaseUrl + filename : 'assets/images/default-poster.png';
  }

  loadPosters() {
    this.http.get('https://add2mart.shop/ionic/coffium/api/get_posters.php')
      .subscribe((res: any) => {
        if (res.success) {
          this.posters = res.posters;
        } else {
          console.warn('Failed to load posters', res.error);
        }
      }, err => console.error(err));
  }
  ngOnInit() {
    this.waitForUserId();
    this.loadPosters();
    this.loadCategories();
    this.loadProducts();

    // ✅ If no user logged in, show welcome toast
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      this.showGuestToast();
    }
  }

  async showGuestToast() {
    const toast = await this.toastCtrl.create({
      message: 'Sign in or register to checkout!',
      position: 'bottom',
      color: 'light',
      mode: 'md', // Try 'md' mode instead of 'ios'
      cssClass: 'guest-toast',
      animated: true,
      buttons: [
        {
          text: 'Sign In',
          handler: () => this.router.navigate(['/login']),
        } as any,
        {
          text: 'Register',
          handler: () => this.router.navigate(['/register']),
        } as any,
        {
          text: 'Dismiss',
          role: 'cancel',
        } as any
      ]
    });

    await toast.present();
  }


  

  selectOption(option: string) {
    this.selectedOption = option;
  }

  selectCategory(cat: { category_id: number; category_name: string }) {
    this.selectedCategoryId = cat.category_id;
    this.showToast(`Selected category: ${cat.category_name}`, 'primary');
    this.filterProductsByCategory();
  }

  filterProductsByCategory() {
    if (!this.selectedCategoryId) {
      // No category selected → show all products
      this.topProducts = [...this.allTopProducts];
      this.suggestedProducts = [...this.allSuggestedProducts];
      return;
    }

    this.topProducts = this.allTopProducts.filter(
      p => p.category_id === this.selectedCategoryId
    );

    this.suggestedProducts = this.allSuggestedProducts.filter(
      p => p.category_id === this.selectedCategoryId
    );
  }


  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }



  

  // 🔧 New function to wait for user_id to appear
  waitForUserId(retries: number = 5) {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.user.user_id = +userId;
      this.user.first_name = localStorage.getItem('first_name') || '';
      this.user.last_name = localStorage.getItem('last_name') || '';
      this.loadUserData(userId);
    } else if (retries > 0) {
      console.warn('User ID missing — retrying...');
      setTimeout(() => this.waitForUserId(retries - 1), 500);
    } else {
      console.error('User ID not found after retries.');
    }
  }

  userImageBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/profile_picture/';

  loadUserData(userId: string) {
    this.http.get(`https://add2mart.shop/ionic/coffium/api/get_user.php?user_id=${userId}`)
      .subscribe(
        (res: any) => {
          if (res.success && res.user) {
            this.user = {
              user_id: res.user.user_id || res.user.id || 0,
              first_name: res.user.first_name || '',
              last_name: res.user.last_name || '',
              email: res.user.email || '',
              address: res.user.address || '',
              profile_image: res.user.profile_image
                ? this.userImageBaseUrl + res.user.profile_image
                : 'assets/images/default-profile.png'
            };
            console.log('✅ Loaded user image:', this.user.profile_image);
          } else {
            console.warn('User not found or API error:', res.message);
          }
        },
        err => {
          console.error('Error loading user:', err);
        }
      );
  }

  loadCategories() {
    this.http
      .get<{ success: boolean; categories: { category_id: number; category_name: string }[] }>(
        'https://add2mart.shop/ionic/coffium/api/get_categories.php'
      )
      .subscribe(
        res => {
          if (res.success) this.categories = res.categories;
          else this.showToast('Failed to load categories', 'danger');
        },
        err => {
          console.error(err);
          this.showToast('Server error loading categories', 'danger');
        }
      );
  }

  loadProducts() {
    this.http.get('https://add2mart.shop/ionic/coffium/api/get_products.php')
      .subscribe((res: any) => {
        if (res.success) {
          this.allTopProducts = res.products || [];
          this.topProducts = [...this.allTopProducts];

          this.allSuggestedProducts = res.products || [];
          this.suggestedProducts = [...this.allSuggestedProducts];
        }
      });
  }

  clearFilter() {
    this.selectedCategoryId = null;
    this.topProducts = [...this.allTopProducts];
    this.suggestedProducts = [...this.allSuggestedProducts];
    this.showToast('Filter cleared', 'medium');
  }

 
    openProduct(product: any) {
      this.router.navigate(['/product', product.product_id]);
    }


  logout() {
    localStorage.removeItem('user_id');
    this.showToast('Logged out successfully', 'medium');
    window.location.href = '/login';
  }
  
 
  }




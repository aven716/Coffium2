import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { Subscription } from 'rxjs';

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
  IonToast,
  IonRefresher,
  IonRefresherContent
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
    AppHeaderComponent,
    IonRefresher,
    IonRefresherContent
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
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) { }
  productBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/products/';


  onHeaderToggleMenu() {
    console.log('HomePage received toggleMenu event');
    this.menu.enable(true, 'first'); // make sure the menu is enabled
    this.menu.toggle('first').then(() => {
      console.log('Menu toggled from HomePage');
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']); // Redirect to Profile page
  }
  goToFavorites() {
    this.router.navigate(['/wishlist']);
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

  wishlistSubscription!: Subscription;
  wishlistProductIds: Set<number> = new Set();

  ngOnInit() {
    this.waitForUserId();
    this.loadPosters();
    this.loadCategories();
    this.loadProducts();

    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.wishlistService.loadWishlist(userId); // load from API

      // 🔹 subscribe to wishlist changes
      this.wishlistSubscription = this.wishlistService.wishlistItems$.subscribe(ids => {
        this.wishlistProductIds = ids;
      });
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

  async toggleWishlist(product: any, event: Event) {
    event.stopPropagation(); // Prevent opening product page

    if (!this.user.user_id) {
      await this.showToast('Please log in to add to wishlist', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    await this.wishlistService.toggleWishlist(this.user.user_id, product.product_id);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
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
    this.http.get<any>('https://add2mart.shop/ionic/coffium/api/get_products.php')
      .subscribe(
        async (productsRes) => {
          if (productsRes.success) {
            const products = productsRes.products;

            // 🔄 Load ratings for each product
            const productsWithRatings = await Promise.all(
              products.map(async (product: any) => {
                try {
                  const ratingsRes: any = await this.http
                    .get(`https://add2mart.shop/ionic/coffium/api/get_ratings.php?product_id=${product.product_id}`)
                    .toPromise();

                  let average = 0;
                  let ratingCount = 0;

                  if (ratingsRes && ratingsRes.success && Array.isArray(ratingsRes.ratings) && ratingsRes.ratings.length > 0) {
                    const total = ratingsRes.ratings.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0);
                    ratingCount = ratingsRes.ratings.length;
                    average = total / ratingCount;
                  }

                  // ✅ Force to number before calling toFixed
                  return {
                    ...product,
                    rating: Number(average.toFixed(1)),
                    ratingCount
                  };
                } catch (err) {
                  console.error(`Error loading ratings for product ${product.product_id}:`, err);
                  return { ...product, rating: 0, ratingCount: 0 };
                }
              })
            );


            // ✅ Assign to product lists
            this.allTopProducts = productsWithRatings;
            this.allSuggestedProducts = productsWithRatings;
            this.topProducts = [...this.allTopProducts];
            this.suggestedProducts = [...this.allSuggestedProducts];
          } else {
            this.showToast('Failed to load products', 'danger');
          }
        },
        (err) => {
          console.error('Error loading products:', err);
          this.showToast('Server error loading products', 'danger');
        }
      );
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
  
  async quickAddToCart(product: any) {
    if (!this.user.user_id) {
      await this.showToast('Please log in to add items to cart', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    // Check if product has options (sizes, pieces)
    if (product.options && product.options.length > 0) {
      // If product has options, go to product page instead
      this.router.navigate(['/product', product.product_id]);
      await this.showToast('Please select an option', 'primary');
      return;
    }

    // Add directly to cart with quantity 1
    const success = await this.cartService.addToCart(
      this.user.user_id,
      product.product_id,
      1,
      product.price
    );

    if (success) {
      // Optionally update cart count badge here
    }
  }

  /**
   * Buy now - navigates to product page for selection
   * then to checkout
   */
  buyNow(product: any) {
    if (!this.user.user_id) {
      this.showToast('Please log in to continue', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    // Navigate to product page
    this.router.navigate(['/product', product.product_id], {
      queryParams: { buyNow: true }
    });
 
  }
  doRefresh(event: any) {
    console.log('Refreshing...');
    this.loadUserData(localStorage.getItem('user_id') || '');
    this.loadProducts();
    this.loadCategories();
    this.loadPosters();

    setTimeout(() => {
      event.target.complete(); // stops the spinner
    }, 1000); // you can adjust timing
  }


}

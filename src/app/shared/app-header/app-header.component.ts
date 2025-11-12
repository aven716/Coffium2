import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuController, ToastController } from '@ionic/angular';
import {
  IonIcon, IonInput, IonList, IonItem, IonLabel, IonAvatar, IonCard,
  IonCardHeader, IonContent, IonSearchbar, IonHeader, IonToolbar, IonMenuButton, IonButtons, IonSpinner, IonThumbnail, IonButton
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonMenuButton, IonButtons,
    IonIcon, IonInput, IonList, IonItem, IonLabel, IonAvatar, IonCard, IonCardHeader, IonContent,
    IonSearchbar, IonSpinner, IonThumbnail, IonButton],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  @Input() showSearchbar: boolean = true;
  @Input() showIcons: boolean = true;
  @Output() toggleMenu = new EventEmitter<void>();

  user = {
    user_id: 0,
    first_name: '',
    last_name: '',
    email: '',
    profile_image: '',
    address: ''
  };

  searchQuery: string = '';
  searchResults: any[] = [];
  searching: boolean = false;
  searchExpanded = false;
  searchActive = false; // NEW: Track if search is active

  constructor(
    private http: HttpClient,
    private menu: MenuController,
    private router: Router,
    private toastCtrl: ToastController,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.platform.ready().then(async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: '#35593E' });
        await StatusBar.setStyle({ style: Style.Light });
      } catch (err) {
        console.warn('StatusBar plugin not available', err);
      }
    });

    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.loadUserData(userId);
    }
  }

  toggleSidebar() {
    console.log('Header click - emitting toggleMenu');
    this.toggleMenu.emit();
  }

  loadUserData(userId: string) {
    this.http.get(`https://add2mart.shop/ionic/coffium/api/get_user.php?user_id=${userId}`)
      .subscribe((res: any) => {
        if (res.success && res.user) {
          this.user = {
            user_id: res.user.id || 0,
            first_name: res.user.first_name || '',
            last_name: res.user.last_name || '',
            email: res.user.email || '',
            address: res.user.address || '',
            profile_image: res.user.profile_image
              ? `https://add2mart.shop/ionic/coffium/api/images/profile_picture/${res.user.profile_image}`
              : 'assets/images/default-profile.png'
          };
        }
      }, err => console.error('User fetch error:', err));
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }

  /** 🔍 Updated: Search for products matching the query */
  onSearchChange(event: any) {
    // Handle both ion-searchbar and regular input
    const query = event.detail?.value || event.target?.value || '';
    this.searchQuery = query.trim();

    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    this.http
      .get(`https://add2mart.shop/ionic/coffium/api/search_products.php?query=${encodeURIComponent(this.searchQuery)}`)
      .subscribe(
        (res: any) => {
          this.searching = false;
          if (res.success && res.products) {
            this.searchResults = res.products;
          } else {
            this.searchResults = [];
          }
        },
        err => {
          console.error('Search error:', err);
          this.searching = false;
          this.showToast('Search failed', 'danger');
        }
      );
  }

  /** 📦 Navigate to the product page */
  openProduct(product: any) {
    this.router.navigate(['/product', product.product_id]);
    this.clearSearch(); // Clear after navigation
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  /** UPDATED: Toggle search expansion */
  toggleSearch() {
    this.searchActive = !this.searchActive;
    this.searchExpanded = !this.searchExpanded;

    // Focus input after animation
    if (this.searchActive) {
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }
  activateSearch() {
    this.searchActive = true;
    this.searchExpanded = true;

    // Focus input after animation
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  /** NEW: Clear search and reset state */
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchActive = false;
    this.searchExpanded = false;
  }

  /** NEW: Handle search blur */
  onSearchBlur() {
    // Delay to allow clicking on results
    setTimeout(() => {
      if (!this.searchQuery) {
        this.searchActive = false;
        this.searchExpanded = false;
        this.searchResults = [];
      }
    }, 200);
  }
}
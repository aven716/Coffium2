import {  CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { WishlistService } from 'src/app/services/wishlist.service';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-wishlist',
    templateUrl: './wishlist.page.html',
    styleUrls: ['./wishlist.page.scss'],
    imports: [
        CommonModule,
        RouterModule,
        DecimalPipe,
        // 👇 Individual Ionic components
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButton,
        IonIcon,
        AppHeaderComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})


export class WishlistPage implements OnInit {
    userId: number = 0;
    wishlistProducts: any[] = [];
    apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

    constructor(
        private wishlistService: WishlistService,
        private router: Router,
        private http: HttpClient,
        private toastCtrl: ToastController
    ) { }

    ngOnInit() {
        this.userId = Number(localStorage.getItem('user_id')) || 0;
        if (!this.userId) {
            this.showToast('Please login to view your wishlist', 'warning');
            this.router.navigate(['/login']);
            return;
        }

        // Load wishlist into local service state
        this.wishlistService.loadWishlist(this.userId);

        // Load full wishlist products for display
        this.loadWishlist();

        // Optional: auto-update UI when wishlist changes
        this.wishlistService.wishlistItems$.subscribe(() => {
            // just trigger change detection if needed
        });
    }


    loadWishlist() {
        this.wishlistService.getWishlistWithProducts(this.userId).subscribe({
            next: (res: any) => {
                if (res.success && res.wishlist) {
                    this.wishlistProducts = res.wishlist;
                } else {
                    this.wishlistProducts = [];
                }

            },
            error: (err) => {
                console.error('Error loading wishlist:', err);
                this.wishlistProducts = [];
            },
        });
    }

    async toggleWishlist(productId: number, event: Event) {
        event.stopPropagation();
        await this.wishlistService.toggleWishlist(this.userId, productId);
        this.loadWishlist(); // reload list after change
    }

    openProduct(productId: number) {
        this.router.navigate(['/product', productId]);
    }
    isInWishlist(productId: number): boolean {
        return this.wishlistService.isInWishlist(productId);
    }
    async showToast(message: string, color: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        await toast.present();
    }
}

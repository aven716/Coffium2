import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';
    private wishlistItems = new BehaviorSubject<Set<number>>(new Set());

    wishlistItems$ = this.wishlistItems.asObservable();

    constructor(
        private http: HttpClient,
        private toastCtrl: ToastController
    ) { }

    // Load user's wishlist
    loadWishlist(userId: number): void {
        this.http.get<any>(`${this.apiBaseUrl}get_wishlist.php?user_id=${userId}`)
            .subscribe({
                next: (res) => {
                    if (res.success && res.wishlist) {
                        const productIds = new Set<number>(
                            res.wishlist.map((item: any) => Number(item.product_id))
                        );
                        this.wishlistItems.next(productIds);
                    }
                },
                error: (err) => console.error('Error loading wishlist:', err)
            });
    }

    isInWishlist(productId: number): boolean {
        return this.wishlistItems.value.has(productId);
    }

    // Toggle wishlist (add or remove)
    async toggleWishlist(userId: number, productId: number): Promise<boolean> {
        if (!userId) {
            await this.showToast('Please log in first', 'warning');
            return false;
        }

        const isCurrentlyInWishlist = this.isInWishlist(productId);
        const endpoint = isCurrentlyInWishlist ? 'remove_from_wishlist.php' : 'add_to_wishlist.php';

        return new Promise((resolve) => {
            this.http.post(`${this.apiBaseUrl}${endpoint}`, {
                user_id: userId,
                product_id: productId
            }).subscribe({
                next: async (res: any) => {
                    if (res.success) {
                        // Update local state
                        const currentItems = new Set(this.wishlistItems.value);
                        if (isCurrentlyInWishlist) {
                            currentItems.delete(productId);
                            await this.showToast('Removed from wishlist', 'medium');
                        } else {
                            currentItems.add(productId);
                            await this.showToast('Added to wishlist', 'success');
                        }
                        this.wishlistItems.next(currentItems);
                        resolve(true);
                    } else {
                        await this.showToast(res.message || 'Failed to update wishlist', 'danger');
                        resolve(false);
                    }
                },
                error: async (err) => {
                    console.error('Wishlist error:', err);
                    await this.showToast('Error updating wishlist', 'danger');
                    resolve(false);
                }
            });
        });
    }

    // Get full wishlist with product details
    getWishlistWithProducts(userId: number): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}get_wishlist_products.php?user_id=${userId}`);
    }

    private async showToast(message: string, color: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        await toast.present();
    }
}
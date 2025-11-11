import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

    constructor(
        private http: HttpClient,
        private toastCtrl: ToastController
    ) { }

    async addToCart(
        userId: number,
        productId: number,
        quantity: number,
        unitPrice: number,
        optionSelected?: string
    ): Promise<boolean> {
        if (!userId) {
            await this.showToast('Please log in first', 'danger');
            return false;
        }

        const payload = {
            user_id: userId,
            product_id: productId,
            quantity: quantity,
            unit_price: unitPrice,
            option_selected: optionSelected || null
        };

        return new Promise((resolve) => {
            this.http.post(`${this.apiBaseUrl}add_to_cart.php`, payload)
                .subscribe({
                    next: async (res: any) => {
                        if (res.success) {
                            await this.showToast(res.message || 'Added to cart', 'success');
                            resolve(true);
                        } else {
                            await this.showToast(res.message || 'Failed to add to cart', 'danger');
                            resolve(false);
                        }
                    },
                    error: async (err) => {
                        console.error('Add to cart error:', err);
                        await this.showToast('Failed to add to cart', 'danger');
                        resolve(false);
                    }
                });
        });
    }

    getCartCount(userId: number): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}get_cart.php?user_id=${userId}`);
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
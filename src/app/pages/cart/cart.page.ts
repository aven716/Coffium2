import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import {
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonThumbnail,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonText,
    IonFooter,
    ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, trash, cartOutline } from 'ionicons/icons';

interface CartItem {
    cart_item_id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    option_selected: string | null;
    // Additional product details from JOIN
    product_name?: string;
    product_image?: string;
    product_description?: string;
}

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppHeaderComponent,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonButtons,
        IonBackButton,
        IonList,
        IonItem,
        IonLabel,
        IonThumbnail,
        IonButton,
        IonIcon,
        IonCard,
        IonCardContent,
        IonText,
        IonFooter
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit {
    cartItems: CartItem[] = [];
    cartId: number = 0;
    userId: number = 0;
    isLoading: boolean = true;
    deliveryOption: 'pickup' | 'delivery' = 'pickup'; 
    apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';
    productImageBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/products/';

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastCtrl: ToastController
    ) {
        addIcons({ add, remove, trash, cartOutline });
    }

    ngOnInit() {
        this.userId = Number(localStorage.getItem('user_id')) || 0;
        if (this.userId) {
            this.loadCart();
        } else {
            this.showToast('Please login to view your cart', 'warning');
            this.router.navigate(['/login']);
        }
    }

    loadCart() {
        this.isLoading = true;
        this.http.get<any>(`${this.apiBaseUrl}get_cart.php?user_id=${this.userId}`)
            .subscribe({
                next: (res) => {
                    if (res.success) {
                        this.cartId = res.cart_id;
                        this.cartItems = res.items || [];
                    } else {
                        this.cartItems = [];
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading cart:', err);
                    this.showToast('Failed to load cart', 'danger');
                    this.isLoading = false;
                }
            });
    }

    updateQuantity(item: CartItem, change: number) {
        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            this.removeItem(item);
            return;
        }

        this.http.post(`${this.apiBaseUrl}update_cart_item.php`, {
            cart_item_id: item.cart_item_id,
            quantity: newQuantity
        }).subscribe({
            next: (res: any) => {
                if (res.success) {
                    item.quantity = newQuantity;
                    item.total_price = item.unit_price * newQuantity;
                    this.showToast('Cart updated', 'success');
                } else {
                    this.showToast(res.message || 'Failed to update', 'danger');
                }
            },
            error: () => {
                this.showToast('Error updating cart', 'danger');
            }
        });
    }

    removeItem(item: CartItem) {
        this.http.post(`${this.apiBaseUrl}remove_cart_item.php`, {
            cart_item_id: item.cart_item_id
        }).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.cartItems = this.cartItems.filter(i => i.cart_item_id !== item.cart_item_id);
                    this.showToast('Item removed from cart', 'success');
                } else {
                    this.showToast(res.message || 'Failed to remove', 'danger');
                }
            },
            error: () => {
                this.showToast('Error removing item', 'danger');
            }
        });
    }

    getProductImage(filename: string | undefined) {
        return filename ? this.productImageBaseUrl + filename : 'assets/images/default-product.png';
    }

    get totalAmount(): number {
        return this.cartItems.reduce((sum, item) => sum + item.total_price, 0);
    }

    get totalItems(): number {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    get deliveryFee(): number {
        return this.deliveryOption === 'delivery' ? 50 : 0;
    }

    get grandTotal(): number {
        return this.totalAmount + this.deliveryFee;
    }

    setDeliveryOption(option: 'pickup' | 'delivery') {
        this.deliveryOption = option;
    }

    checkout() {
        if (this.cartItems.length === 0) {
            this.showToast('Your cart is empty', 'warning');
            return;
        }
        // Navigate to checkout page
        this.router.navigate(['/checkout']);
    }

    continueShopping() {
        this.router.navigate(['/home']);
    }

    goToProduct(productId: number) {
        this.router.navigate(['/product', productId]);
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
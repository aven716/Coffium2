import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonFooter
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-order',
    standalone: true,
    templateUrl: './order.page.html',
    styleUrls: ['./order.page.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonFooter
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrderPage implements OnInit {

    order: any = null;
    apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private toastCtrl: ToastController
    ) { }

    async showToast(message: string, color: string = 'primary') {
        const toast = await this.toastCtrl.create({
            message,
            color,
            duration: 2500,
            position: 'bottom'
        });
        await toast.present();
    }

    ngOnInit() {
        // 1️⃣ Get order ID from route param (e.g., /order/:id)
        let orderId = this.route.snapshot.paramMap.get('id');

        // 2️⃣ If no route param, check localStorage (for GCash deep link)
        if (!orderId) {
            orderId = localStorage.getItem('pending_order_id');
            if (orderId) {
                localStorage.removeItem('pending_order_id'); // cleanup
            }
        }

        // 3️⃣ Fallback: check query param from deep link (coffium://home?order_id=XXX)
        if (!orderId) {
            const urlParams = new URLSearchParams(window.location.search);
            const param = urlParams.get('order_id');
            if (param) orderId = param;
        }

        // 4️⃣ Fetch order from API if we have ID
        if (orderId) {
            this.fetchOrder(orderId);
        } else {
            this.showToast('No order ID provided', 'warning');
        }
    }

    async fetchOrder(orderId: string | number) {
        try {
            const res: any = await this.http
                .get(`${this.apiBaseUrl}get_order.php?order_id=${orderId}`)
                .toPromise();

            if (res && res.success && res['order']) {
                this.order = res['order'];

                // Ensure totals are numbers
                this.order.subtotal = Number(this.order.subtotal) || 0;
                this.order.delivery_fee = Number(this.order.delivery_fee) || 0;
                this.order.total_amount = Number(this.order.total_amount) || 0;

                // Normalize item prices
                this.order.items = (this.order.items || []).map((item: any) => ({
                    ...item,
                    unit_price: Number(item.unit_price) || 0,
                    total_price: Number(item.total_price) || 0
                }));

                console.log('✅ Order fetched from API:', this.order);
            } else {
                this.showToast(res?.message || 'Order not found', 'warning');
            }
        } catch (err) {
            console.error('💥 Error fetching order:', err);
            this.showToast('Failed to load order', 'danger');
        }
    }
    getProductImage(filename: string) {
        return filename ? `${this.apiBaseUrl}images/products/${filename}` : 'assets/images/default-product.png';
    }

    continueShopping() {
        this.router.navigate(['/home']);
    }
}
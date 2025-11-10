import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
        IonLabel
    ]
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
        const navigation = this.router.getCurrentNavigation();
        let orderId: string | null = null;

        // 1️⃣ Try router state first
        if (navigation?.extras.state && navigation.extras.state['order']) {
            this.order = navigation.extras.state['order'];
            return;
        }

        // 2️⃣ Try route param
        orderId = this.route.snapshot.paramMap.get('id');

        // 3️⃣ Fallback to localStorage (GCash redirect)
        if (!orderId) {
            orderId = localStorage.getItem('pending_order_id');
            localStorage.removeItem('pending_order_id'); // clean up
        }

        // 4️⃣ Fetch order details
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

            if (res.success && res.order) {
                this.order = res.order;
                console.log('✅ Order fetched from API:', this.order);
            } else {
                this.showToast('Order not found', 'warning');
            }
        } catch (err) {
            console.error(err);
            this.showToast('Failed to load order', 'danger');
        }
    }
}

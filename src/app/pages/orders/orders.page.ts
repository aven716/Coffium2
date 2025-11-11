import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { addIcons } from 'ionicons';
import { cubeOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppHeaderComponent,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonIcon,
        IonRefresher,
        IonRefresherContent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './orders.page.html',
    styleUrls: ['./orders.page.scss']
})
export class OrdersPage implements OnInit {
    orders: any[] = [];
    isLoading = true;
    userId: number = 0;
    apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

    constructor(private http: HttpClient, private router: Router) {
        addIcons({ cubeOutline, checkmarkCircleOutline, timeOutline });
    }

    ngOnInit() {
        this.userId = Number(localStorage.getItem('user_id')) || 0;
        if (!this.userId) {
            this.router.navigate(['/login']);
            return;
        }
        this.loadOrders();
    }

    loadOrders(event?: any) {
        this.isLoading = true;
        this.http.get<any>(`${this.apiBaseUrl}get_orders.php?user_id=${this.userId}`)
            .subscribe({
                next: (res) => {
                    if (res.success && res.orders) {
                        this.orders = res.orders;
                    } else {
                        this.orders = [];
                    }
                    this.isLoading = false;
                    if (event) event.target.complete();
                },
                error: (err) => {
                    console.error('Error loading orders:', err);
                    this.isLoading = false;
                    if (event) event.target.complete();
                }
            });
    }

    openOrder(orderId: number) {
        this.router.navigate(['/order', orderId]);
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'to deliver': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'medium';
        }
    }
}

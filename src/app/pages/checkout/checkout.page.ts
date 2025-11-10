
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { App } from '@capacitor/app';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import {
    IonContent,
    IonButton,
    IonIcon,
    IonFooter,
    ToastController,
    LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, cardOutline, cashOutline } from 'ionicons/icons';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Geolocation } from '@capacitor/geolocation';


interface CartItem {
    cart_item_id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    option_selected: string | null;
}

interface OrderData {
    user_id: number;
    first_name: string;
    last_name: string;
    contact_number: string;
    address: string;
    delivery_option: 'pickup' | 'delivery';
    payment_method: 'cod' | 'gcash';
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
    items: CartItem[];
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        AppHeaderComponent,
        SafeUrlPipe,
        IonContent,
        IonButton,
        IonIcon,
        IonFooter
        
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './checkout.page.html',
    styleUrls: ['./checkout.page.scss']
})




export class CheckoutPage implements OnInit, AfterViewInit {
    // User info
    userId: number = 0;
    firstName: string = '';
    lastName: string = '';
    contactNumber: string = '';
    address: string = '';

    // Order details
    cartItems: CartItem[] = [];
    deliveryOption: 'pickup' | 'delivery' = 'pickup';
    paymentMethod: 'cod' | 'gcash' = 'cod';

    // Map
    mapboxToken = 'pk.eyJ1IjoibHZmd3IiLCJhIjoiY21obm4xa2FwMDI4dTJsb28zeWYxcmVqNCJ9.A9pJfJ1hvz6qum7CT20QxA'; // Replace with your Mapbox token
    latitude: number = 14.6760; // Default: Quezon City
    longitude: number = 121.0437;

    isLoading = true;
    isProcessing = false;

    apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';
    productImageBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/products/';

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController
    ) {
        addIcons({ locationOutline, cardOutline, cashOutline });
      

    }
    

    ngOnInit() {
        this.userId = Number(localStorage.getItem('user_id')) || 0;

        if (!this.userId) {
            this.showToast('Please login first', 'warning');
            this.router.navigate(['/login']);
            return;
        }

        // Use bracket notation because state has index signature
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state && navigation.extras.state['orderId']) {
            const orderId = navigation.extras.state['orderId'];
            // Navigate directly to OrderPage, no polling needed
            this.router.navigate(['/order', orderId]);
        }


        this.loadUserData();
        this.loadCart();
    }

  
    loadCart(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${this.apiBaseUrl}get_cart.php?user_id=${this.userId}`)
                .subscribe({
                    next: (res) => {
                        if (res.success && res.items) {
                            this.cartItems = res.items;
                        }
                        this.isLoading = false;
                        resolve();
                    },
                    error: (err) => {
                        console.error('Error loading cart:', err);
                        this.showToast('Failed to load cart', 'danger');
                        this.isLoading = false;
                        reject(err);
                    }
                });
        });
    }

    loadUserData(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.http.get<any>(`${this.apiBaseUrl}get_user.php?user_id=${this.userId}`)
                .subscribe({
                    next: (res) => {
                        if (res.success && res.user) {
                            this.firstName = res.user.first_name || '';
                            this.lastName = res.user.last_name || '';
                            this.contactNumber = res.user.contact_number || '';
                            this.address = res.user.address || '';
                        }
                        resolve();
                    },
                    error: (err) => {
                        console.error('Error loading user data:', err);
                        reject(err);
                    }
                });
        });
    }


    get subtotal(): number {
        return this.cartItems.reduce((sum, item) => sum + item.total_price, 0);
    }

    get deliveryFee(): number {
        return this.deliveryOption === 'delivery' ? 50 : 0;
    }

    get totalAmount(): number {
        return this.subtotal + this.deliveryFee;
    }

    getProductImage(filename: string) {
        return filename ? this.productImageBaseUrl + filename : 'assets/images/default-product.png';
    }

    setDeliveryOption(option: 'pickup' | 'delivery') {
        this.deliveryOption = option;

        if (option === 'delivery') {
            setTimeout(() => {
                this.initMapbox();
            }, 0);
        }
    }

    setPaymentMethod(method: 'cod' | 'gcash') {
        this.paymentMethod = method;
    }

    validateForm(): boolean {
        if (!this.firstName || !this.lastName) {
            this.showToast('Please enter your name', 'warning');
            return false;
        }

        if (!this.contactNumber) {
            this.showToast('Please enter your contact number', 'warning');
            return false;
        }

        if (this.deliveryOption === 'delivery' && !this.address) {
            this.showToast('Please enter your delivery address', 'warning');
            return false;
        }

        if (this.cartItems.length === 0) {
            this.showToast('Your cart is empty', 'warning');
            return false;
        }

        return true;
    }

    async placeOrder() {
        if (this.isProcessing) return; // 🔒 prevent duplicate clicks
        this.isProcessing = true;

        if (!this.validateForm()) {
            this.isProcessing = false; // reset if validation fails
            return;
        }

        const loading = await this.loadingCtrl.create({ message: 'Processing...' });
        await loading.present();

        try {
            const orderData: OrderData = {
                user_id: this.userId,
                first_name: this.firstName,
                last_name: this.lastName,
                contact_number: this.contactNumber,
                address: this.address,
                delivery_option: this.deliveryOption,
                payment_method: this.paymentMethod,
                subtotal: this.subtotal,
                delivery_fee: this.deliveryFee,
                total_amount: this.totalAmount,
                items: this.cartItems
            };

            // 1️⃣ Create order in the database
            const res: any = await this.http
                .post(`${this.apiBaseUrl}create_order.php`, orderData)
                .toPromise();

            if (!res.success || !res.order_id) {
                await loading.dismiss();
                this.showToast(res.message || 'Order creation failed', 'warning');
                return;
            }

            const orderId = res.order_id;

            // Store orderId for GCash redirect
            if (this.paymentMethod === 'gcash') {
                localStorage.setItem('pending_order_id', orderId);
                await this.processGCashPayment(orderData, loading);
            } else {
                await loading.dismiss();
                this.showToast('Order placed successfully!', 'success');
                this.clearCart();
                this.router.navigate(['/order', orderId]);
            }

        } catch (error) {
            await loading.dismiss();
            console.error(error);
            this.showToast('Server error, please try again later.', 'danger');
        }
        finally {
            this.isProcessing = false; // 🔓 reset flag
        }
    }






    async processGCashPayment(orderData: OrderData, loading: HTMLIonLoadingElement) {
        try {
            const response: any = await this.http.post(`${this.apiBaseUrl}create_payment.php`, {
                user_id: orderData.user_id,
                first_name: orderData.first_name,
                last_name: orderData.last_name,
                contact_number: orderData.contact_number,
                address: orderData.address,
                delivery_option: orderData.delivery_option,
                payment_method: 'gcash',
                subtotal: orderData.subtotal,
                delivery_fee: orderData.delivery_fee,
                total_amount: orderData.total_amount,
                items: orderData.items,
                amount: orderData.total_amount * 100,
                description: `Order for ${orderData.first_name} ${orderData.last_name}`
            }).toPromise();

            await loading.dismiss();

            if (response.success && response.checkout_url) {
                // Open GCash checkout
                window.open(response.checkout_url, '_blank');

                // DO NOT navigate or create order again
                this.showToast('Redirecting to GCash...', 'primary');
            } else {
                console.error('❌ Payment creation failed:', response.message);
                this.showToast('Failed to initiate payment', 'danger');
            }
        } catch (error) {
            await loading.dismiss();
            console.error('💥 Error in GCash payment:', error);
            this.showToast('Error creating GCash payment', 'danger');
        }
    }

    clearCart() {
        this.http.post(`${this.apiBaseUrl}clear_cart.php`, {
            user_id: this.userId
        }).subscribe();
    }

    async showToast(message: string, color: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2500,
            color,
            position: 'bottom'
        });
        await toast.present();
    }

    searchAddress() {
        if (!this.address) return;

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.address)}.json?access_token=${this.mapboxToken}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    const coords = data.features[0].center;
                    this.longitude = coords[0];
                    this.latitude = coords[1];

                    // Move marker
                    if (this.map && this.mapMarker) {
                        this.mapMarker.setLngLat([this.longitude, this.latitude]);
                        this.map.flyTo({ center: [this.longitude, this.latitude], zoom: 16 });
                    }
                } else {
                    this.showToast('Address not found', 'warning');
                }
            })
            .catch(err => {
                console.error(err);
                this.showToast('Failed to search address', 'danger');
            });
    }


    @ViewChild('mapContainer', { static: false }) set mapContainerRef(el: ElementRef) {
        if (el && !this.map) {
            this.mapContainer = el;
            this.initMapbox();
        }
    }
    mapContainer!: ElementRef;

    map!: mapboxgl.Map;
    geocoder!: MapboxGeocoder;
mapMarker!: mapboxgl.Marker;
    

    ngAfterViewInit() {
        if (this.mapContainer && this.deliveryOption === 'delivery') {
            this.initMapbox();
        }
    }
    initMapbox() {
        mapboxgl.accessToken = this.mapboxToken;

        if (!this.mapContainer) return;

        // If user allows geolocation, center map there
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.loadMap();
            },
            (err) => {
                console.warn('Geolocation not allowed or failed, using default', err);
                this.loadMap(); // fallback to default
            }
        );
    }

    loadMap() {
        this.map = new mapboxgl.Map({
            container: this.mapContainer.nativeElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.longitude, this.latitude],
            zoom: 14
        });

        this.map.addControl(new mapboxgl.NavigationControl());

        // Marker
        this.mapMarker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([this.longitude, this.latitude])
            .addTo(this.map);

        this.mapMarker.on('dragend', async () => {
            const lngLat = this.mapMarker.getLngLat();
            this.longitude = lngLat.lng;
            this.latitude = lngLat.lat;

            // Reverse geocode
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.longitude},${this.latitude}.json?access_token=${this.mapboxToken}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                this.address = data.features[0].place_name;
            }
        });
    }
    

}
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {  MenuController, ToastController, } from '@ionic/angular';
import { IonToast, IonTextarea, IonButton, IonIcon, IonSpinner, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../shared/app-header/app-header.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ IonContent, CommonModule, FormsModule, AppHeaderComponent, IonToast, IonTextarea, IonButton, IonIcon, IonSpinner],
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss']
})
export class ProductPage {
  productId: number = 0;
  product: any = null;
  productBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/products/';
  quantity: number = 1;

  // --- User object, similar to HomePage
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    profile_image: string;
    address?: string;
  } = {
      user_id: 0,
      first_name: '',
      last_name: '',
      profile_image: 'assets/images/default-profile.png'
    };

  // --- For review submission
  newRating: number = 0;
  newComment: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private menu: MenuController,
    private toastCtrl: ToastController
  ) { }

  selectedOption: string = ''; // will hold size or pieces


  isDrink(): boolean {
    return this.product && this.product.size === 'coffee'; // or some flag from DB
  }
  // --- Set option when user clicks
  selectOption(option: string) {
    this.selectedOption = option;
  }

  ngOnInit() {
    // Get user_id from localStorage like in HomePage
    const userId = localStorage.getItem('user_id');
    if (userId) this.user.user_id = +userId;

    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct();
  }

  onHeaderToggleMenu() {
    this.menu.enable(true, 'first');
    this.menu.toggle('first');
  }

  getProductImage(filename: string) {
    return filename ? this.productBaseUrl + filename : 'assets/images/default-product.png';
  }

  // --- Quantity
  increaseQuantity() { this.quantity++; }
  decreaseQuantity() { if (this.quantity > 1) this.quantity--; }

  // --- Add to cart
  addToCart(product: any, quantity: number) {
    if (!this.user.user_id) {
      this.showToast('Please log in first', 'danger');
      return;
    }

    if (!this.selectedOption) {
      this.showToast('Please select a size or pieces', 'warning');
      return;
    }

    const payload = {
      user_id: this.user.user_id,
      product_id: product.product_id,
      quantity: quantity,
      unit_price: product.price,
      option_selected: this.selectedOption
    };

    this.http.post('https://add2mart.shop/ionic/coffium/api/add_to_cart.php', payload)
      .subscribe(
        (res: any) => this.showToast(res.message || 'Added to cart', 'success'),
        err => this.showToast('Failed to add to cart', 'danger')
      );
  }
  // --- Submit review
  submitReview() {
    if (!this.user.user_id) {
      this.showToast('Please log in first', 'danger');
      return;
    }
    if (!this.newRating || !this.newComment.trim()) {
      this.showToast('Please provide a rating and comment', 'warning');
      return;
    }

    const payload = {
      user_id: this.user.user_id,
      product_id: this.product.product_id,
      rating: this.newRating,
      comment: this.newComment.trim()
      
    };

    this.http.post('https://add2mart.shop/ionic/coffium/api/submit_review.php', payload)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.showToast('Review submitted', 'success');
            this.loadProduct(); // refresh product to show new review
            this.newRating = 0;
            this.newComment = '';
          } else {
            this.showToast(res.message || 'Error submitting review', 'danger');
          }
        },
        err => this.showToast('Server error', 'danger')
      );
  }

  // --- Load product with reviews and ratings
  loadProduct() {
    const url = `https://add2mart.shop/ionic/coffium/api/get_product_details.php?product_id=${this.productId}`;

    this.http.get(url).subscribe(
      (res: any) => {
        if (res.success) {
          this.product = res.product;
          this.product.rating = res.rating?.average || 0;
          this.product.totalRatings = res.rating?.total || 0;
          this.product.comments = res.comments || [];

          // --- set product options dynamically
          this.product.options = res.options || [];

          // Optionally preselect the first option
          if (this.product.options.length > 0) {
            this.selectedOption = this.product.options[0].option_name;
          }
        } else {
          console.warn('Product not found', res.error);
        }
      },
      err => console.error('Error loading product:', err)
    );
  }


  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1500, color });
    await toast.present();
  }
}

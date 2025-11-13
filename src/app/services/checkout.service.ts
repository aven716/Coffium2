import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BuyNowItem {
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    option_selected: string;
}

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    // BehaviorSubject to hold "Buy Now" item
    private buyNowItemSubject = new BehaviorSubject<BuyNowItem | null>(null);
    public buyNowItem$ = this.buyNowItemSubject.asObservable();

    constructor() { }

    /**
     * Set item for "Buy Now" - bypasses cart and goes straight to checkout
     * @param product Product details
     * @param quantity Quantity to purchase
     * @param optionSelected Selected size/pieces option
     */
    setBuyNowItem(product: any, quantity: number, optionSelected: string) {
        const buyNowItem: BuyNowItem = {
            product_id: product.product_id,
            product_name: product.name || product.product_name,
            product_image: product.picture,
            quantity: quantity,
            unit_price: parseFloat(product.price),
            total_price: parseFloat(product.price) * quantity,
            option_selected: optionSelected
        };

        this.buyNowItemSubject.next(buyNowItem);
    }

    /**
     * Get current "Buy Now" item
     */
    getBuyNowItem(): BuyNowItem | null {
        return this.buyNowItemSubject.value;
    }

    /**
     * Check if there's a "Buy Now" item in progress
     */
    hasBuyNowItem(): boolean {
        return this.buyNowItemSubject.value !== null;
    }

    /**
     * Clear "Buy Now" item
     */
    clearBuyNowItem() {
        this.buyNowItemSubject.next(null);
    }
}
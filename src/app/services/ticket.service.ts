import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TicketService {
    private apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

    constructor(private http: HttpClient, private toastCtrl: ToastController) { }

    submitTicket(userId: number, subject: string, message: string): Observable<any> {
        return this.http.post(`${this.apiBaseUrl}submit_ticket.php`, { user_id: userId, subject, message });
    }

    async showToast(message: string, color: string = 'success') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        await toast.present();
    }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Individual Ionic components
import { IonHeader } from '@ionic/angular/standalone';
import { IonToolbar } from '@ionic/angular/standalone';
import { IonTitle } from '@ionic/angular/standalone';
import { IonContent } from '@ionic/angular/standalone';
import { IonCard } from '@ionic/angular/standalone';
import { IonCardHeader } from '@ionic/angular/standalone';
import { IonCardTitle } from '@ionic/angular/standalone';
import { IonCardContent } from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { IonItem } from '@ionic/angular/standalone';
import { IonLabel } from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.page.html',
    styleUrls: ['./contact-us.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonIcon,
        IonItem,
        IonLabel,
        IonButton,
        AppHeaderComponent
    ]
})
export class ContactUsPage { }

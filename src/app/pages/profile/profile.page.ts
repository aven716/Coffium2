import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonAvatar,
  IonSpinner,
  IonList,
  ToastController,
  MenuController,
  LoadingController
} from '@ionic/angular/standalone';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  locationOutline,
  calendarOutline,
  maleFemaleOutline,
  cameraOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  bagOutline,
  cartOutline,
  heartOutline,
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppHeaderComponent,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonAvatar,
    IonSpinner,
    IonList
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact_no: string;
    house_no: string;
    street: string;
    barangay: string;
    city_province: string;
    region: string;
    gender: string;
    birthday: string;
    profile_image: string;
  } = {
      user_id: 0,
      first_name: '',
      last_name: '',
      email: '',
      contact_no: '',
      house_no: '',
      street: '',
      barangay: '',
      city_province: '',
      region: '',
      gender: 'Prefer not to say',
      birthday: '',
      profile_image: 'assets/images/default-profile.png'
    };

  originalUser: any = {};
  isEditing = false;
  loading = true;
  selectedFile: File | null = null;

  userImageBaseUrl = 'https://add2mart.shop/ionic/coffium/api/images/profile_picture/';
  apiBaseUrl = 'https://add2mart.shop/ionic/coffium/api/';

  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  constructor(
    private menu: MenuController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      locationOutline,
      calendarOutline,
      maleFemaleOutline,
      cameraOutline,
      createOutline,
      checkmarkOutline,
      closeOutline,
      bagOutline,
      cartOutline,
      heartOutline,
      settingsOutline,
      logOutOutline
    });
  }

  ngOnInit() {
    this.waitForUserId();
  }

  onHeaderToggleMenu() {
    this.menu.enable(true, 'first');
    this.menu.toggle('first');
  }

  waitForUserId(retries: number = 5) {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.user.user_id = +userId;
      this.loadUserData(userId);
    } else if (retries > 0) {
      setTimeout(() => this.waitForUserId(retries - 1), 500);
    } else {
      this.loading = false;
      this.showToast('Please log in', 'warning');
      this.router.navigate(['/login']);
    }
  }

  loadUserData(userId: string) {
    this.http.get(`${this.apiBaseUrl}get_user.php?user_id=${userId}`)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.user) {
            const u = res.user;
            this.user = {
              user_id: +u.user_id || +u.id || 0,
              first_name: u.first_name || '',
              last_name: u.last_name || '',
              email: u.email || '',
              contact_no: u.contact_no || '',
              house_no: u.house_no || '',
              street: u.street || '',
              barangay: u.barangay || '',
              city_province: u.city_province || '',
              region: u.region || '',
              gender: u.gender || 'Prefer not to say',
              birthday: u.birthday || '',
              profile_image: u.profile_image
                ? this.userImageBaseUrl + u.profile_image
                : 'assets/images/default-profile.png'
            };
            this.originalUser = { ...this.user };
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading user:', err);
          this.showToast('Failed to load profile', 'danger');
          this.loading = false;
        }
      });
  }

  toggleEdit() {
    if (this.isEditing) {
      // Cancel editing
      this.user = { ...this.originalUser };
      this.selectedFile = null;
    }
    this.isEditing = !this.isEditing;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profile_image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    const loading = await this.loadingCtrl.create({
      message: 'Updating profile...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = new FormData();
    formData.append('user_id', this.user.user_id.toString());
    formData.append('first_name', this.user.first_name);
    formData.append('last_name', this.user.last_name);
    formData.append('email', this.user.email);
    formData.append('contact_no', this.user.contact_no);
    formData.append('house_no', this.user.house_no);
    formData.append('street', this.user.street);
    formData.append('barangay', this.user.barangay);
    formData.append('city_province', this.user.city_province);
    formData.append('region', this.user.region);
    formData.append('gender', this.user.gender);
    formData.append('birthday', this.user.birthday);

    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile);
    }

    this.http.post(`${this.apiBaseUrl}update_profile.php`, formData)
      .subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          if (res.success) {
            this.showToast('Profile updated successfully', 'success');
            this.originalUser = { ...this.user };
            this.isEditing = false;
            this.selectedFile = null;
            // Reload to get updated image URL
            this.loadUserData(this.user.user_id.toString());
          } else {
            this.showToast(res.message || 'Failed to update profile', 'danger');
          }
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Update error:', err);
          this.showToast('Error updating profile', 'danger');
        }
      });
  }

  get fullAddress(): string {
    const parts = [
      this.user.house_no,
      this.user.street,
      this.user.barangay,
      this.user.city_province,
      this.user.region
    ].filter(p => p);
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
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

  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    this.showToast('Logged out successfully', 'success');
    this.router.navigate(['/login']);
  }
}
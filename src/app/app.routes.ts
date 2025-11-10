import { Routes } from '@angular/router';
import { RegisterPage } from './pages/register/register.page';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
 
  {
    path: 'verify-otp',
    loadComponent: () => import('./verify-otp/verify-otp.page').then( m => m.VerifyOtpPage)
  },
 
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./product/product.page').then(m => m.ProductPage)
  },
  {
    path: 'faqs',
    loadComponent: () => import('./pages/faqs/faqs.page').then( m => m.FaqsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then( m => m.AboutPage)
  },

  {
    path: 'faqs',
    loadComponent: () => import('./pages/faqs/faqs.page').then(m => m.FaqsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage)
  },

  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage)
  }



];

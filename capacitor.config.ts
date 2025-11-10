// capacitor.config.ts
export default {
  appId: 'com.yourcompany.coffium',
  appName: 'Coffium',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {}
  },
  ios: {
    scheme: 'coffium'   // <-- needed for iOS
  },
  android: {
    scheme: 'coffium'   // <-- needed for Android
  }
};

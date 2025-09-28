# CoinStep - TestFlight Build Guide

## Prerequisites

1. **Apple Developer Account**: You need an active Apple Developer Program membership ($99/year)
2. **EAS CLI**: Install Expo Application Services CLI
   ```bash
   npm install -g @expo/eas-cli
   ```
3. **Xcode**: Latest version installed on macOS
4. **Production API**: Deploy your backend to a production server

## Step-by-Step Build Process

### 1. Setup EAS Account
```bash
eas login
eas build:configure
```

### 2. Update Production API URL
Before building, update the API URL in `app.json`:
```json
"extra": {
  "EXPO_PUBLIC_API_URL": "https://your-actual-production-api.com"
}
```

### 3. Configure Apple Developer Settings
Update `eas.json` with your Apple Developer details:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@example.com",
      "ascAppId": "your-app-store-connect-app-id",
      "appleTeamId": "your-apple-team-id"
    }
  }
}
```

### 4. Build for iOS Production
```bash
# Build the iOS app
npm run build:ios

# Or use EAS directly
eas build --platform ios --profile production
```

### 5. Submit to TestFlight
```bash
# Submit to App Store Connect
npm run submit:ios

# Or use EAS directly
eas submit --platform ios
```

### 6. Complete TestFlight Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app
3. Go to TestFlight tab
4. Add internal testers
5. Fill out required compliance information
6. Submit for TestFlight review

## App Configuration Summary

### Bundle Identifier
- **iOS**: `com.coinstep.app`
- **Android**: `com.coinstep.app`

### App Name
- **Display Name**: CoinStep
- **Slug**: coinstep

### Required Permissions
- **iOS**: HealthKit, Motion & Fitness, Camera, Photo Library
- **Android**: Activity Recognition, Camera, External Storage

### Icons & Assets
- **App Icon**: `./assets/icon.png` (1024x1024)
- **Adaptive Icon**: `./assets/adaptive-icon.png` (Android)
- **Splash Screen**: Uses app icon with brand color background

## Troubleshooting

### Common Issues
1. **Bundle ID conflicts**: Ensure `com.coinstep.app` is unique in App Store Connect
2. **Missing entitlements**: HealthKit capability must be enabled in Apple Developer Portal
3. **API URL**: Make sure production API is accessible and CORS is configured
4. **Icons**: Ensure all icon files exist and are proper dimensions

### Build Commands Reference
```bash
# Development build
eas build --platform ios --profile development

# Preview build (internal distribution)
eas build --platform ios --profile preview

# Production build for TestFlight
eas build --platform ios --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Next Steps After TestFlight

1. **Internal Testing**: Add team members as internal testers
2. **External Testing**: Create external test groups (up to 10,000 testers)
3. **App Store Review**: Submit for full App Store review when ready
4. **Analytics**: Consider adding crash reporting and analytics
5. **Push Notifications**: Set up APNs for challenge notifications

## Production Checklist

- [ ] Backend deployed to production server
- [ ] API URL updated in app configuration
- [ ] Apple Developer account configured
- [ ] App Store Connect app created
- [ ] Bundle identifier registered
- [ ] HealthKit capability enabled
- [ ] Privacy policy URL added (if required)
- [ ] App icons and screenshots prepared
- [ ] TestFlight compliance information completed

# Swipe Strike - phone app (iOS + Android)

This folder wraps the game (`www/index.html`, the offline build of the game) in a native app with
[Capacitor](https://capacitorjs.com). Builds run in the cloud on Codemagic (`/codemagic.yaml` at the repo root),
so no Mac is needed.

## What the app adds over the web version
- Google AdMob ads, only between matches (never during a fight, training or online play):
  at most one full-screen ad every 3 finished CPU matches and never within 3 minutes of the last one.
- Optional rewarded ad in SHOP: unlocks GOLD colours for 24 hours.
- "Remove Ads" one-off purchase (product id `swipestrike.removeads`), which also unlocks GOLD colours forever.
  Restore Purchases and Privacy Settings buttons are in SHOP.
- Privacy consent form (UK/EU) and Apple's tracking prompt before any ad loads.
- Real haptics, landscape lock, no status bar.

The GitHub Pages web version shows none of this (no shop, no ads).

## Before release: swap the test IDs
Everything currently uses Google's **test** ad IDs, which is safe for testing.
1. `www/index.html` (and the game source): in `ADCFG` set `testing:false` and put your 4 ad unit IDs
   (iOS + Android, interstitial + rewarded).
2. `ios/App/App/Info.plist`: `GADApplicationIdentifier` = your iOS AdMob **App ID**.
3. `android/app/src/main/AndroidManifest.xml`: `com.google.android.gms.ads.APPLICATION_ID` = your Android AdMob **App ID**.

## Updating the game inside the app
Copy the new offline build to `www/index.html`, commit and push, then start the Codemagic workflow.

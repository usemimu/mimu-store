# Mimuads for Hosts - Vue.js PWA

A Progressive Web App built with Vue.js 3 for Mimuads screen hosts to track earnings, check screen status, and manage their accounts.

##  Features

- **Progressive Web App (PWA)** - Install on mobile devices and use offline
- **Component-based architecture** - Reusable Vue components throughout
- **Tailwind CSS** - Custom design system with Mimuads brand colors
- **Vue Router** - Client-side routing with navigation guards
- **Phosphor Icons** - Beautiful icon system
- **Dark mode support** - Automatic theme detection with manual override
- **Local state management** - Using VueUse composables

## 📱 Views

- **Onboarding** - Two-step onboarding flow for new hosts
- **Dashboard** - Real-time earnings, plays, and screen status
- **Earnings** - Payout history and WHT information
- **My Screen** - Screen status, health, and issue reporting
- **Referrals** - Referral program with earnings tracking

## 🛠 Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```



### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```


The app uses a custom design system based on the Mimuads brand:

- **Colors**: Clay (primary), Moss (success), Gold (accent), Neutral (grays)
- **Typography**: Cormorant (display), Plus Jakarta Sans (body)
- **Icons**: Phosphor Icons (regular & fill weights)

All design tokens are defined in `src/assets/design-system.css` and extended in Tailwind config.

## Project Structure

```
app/
├── public/              # Static assets and PWA manifest
├── src/
│   ├── assets/         # Design system CSS
│   ├── components/     # Reusable Vue components
│   │   ├── Logo.vue
│   │   ├── StatusBar.vue
│   │   ├── TabBar.vue
│   │   └── WaButton.vue
│   ├── composables/    # Vue composables for state management
│   │   └── useAppState.js
│   ├── router/         # Vue Router configuration
│   │   └── index.js
│   ├── views/          # Page components
│   │   ├── OnboardingView.vue
│   │   ├── DashboardView.vue
│   │   ├── EarningsView.vue
│   │   ├── MyScreenView.vue
│   │   └── ReferralsView.vue
│   ├── App.vue         # Root component
│   ├── main.js         # App entry point
│   └── style.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite & PWA configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## 🔧 Technologies

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Vue Router** - Official router for Vue.js
- **Tailwind CSS** - Utility-first CSS framework
- **VueUse** - Collection of Vue composition utilities
- **Phosphor Icons** - Flexible icon family for Vue
- **Vite PWA** - Zero-config PWA plugin for Vite

## 🌐 PWA Configuration

The app is configured as a PWA with:

- Offline support via service worker
- App manifest for installation
- Caching strategies for fonts and assets
- Mobile-optimized viewport

##  License

Copyright © 2026 Mimuads
